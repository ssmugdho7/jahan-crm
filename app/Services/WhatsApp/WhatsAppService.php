<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Models\Contact;
use App\Models\WhatsappAccount;
use App\Models\WhatsappCampaign;
use App\Models\WhatsappContact;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use App\Models\WhatsappTemplate;
use App\Models\WhatsappWebhook;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WhatsAppService
{
    public function connectAccount(array $data): WhatsappAccount
    {
        $account = WhatsappAccount::create([
            'user_id' => auth()->id(),
            'business_name' => $data['business_name'],
            'phone_number' => $data['phone_number'],
            'country_code' => $data['country_code'] ?? '+880',
            'whatsapp_business_account_id' => $data['whatsapp_business_account_id'],
            'phone_number_id' => $data['phone_number_id'],
            'meta_app_id' => $data['meta_app_id'] ?? null,
            'meta_app_secret' => $data['meta_app_secret'],
            'permanent_access_token' => $data['permanent_access_token'],
            'webhook_verify_token' => $data['webhook_verify_token'] ?? Str::random(32),
            'business_website' => $data['business_website'] ?? null,
            'business_email' => $data['business_email'] ?? null,
            'connection_status' => 'pending',
        ]);

        $testResult = $this->testConnection($account->id);

        if ($testResult['success']) {
            $account->update([
                'connection_status' => 'connected',
                'last_sync_at' => now(),
            ]);
        }

        return $account->fresh();
    }

    public function testConnection(int $accountId): array
    {
        $account = WhatsappAccount::findOrFail($accountId);

        try {
            $response = Http::withToken($account->permanent_access_token)
                ->get("https://graph.facebook.com/v18.0/{$account->phone_number_id}", [
                    'fields' => 'id,verified_name,display_phone_number,quality_rating',
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data,
                    'message' => 'Connection successful',
                ];
            }

            return [
                'success' => false,
                'message' => $response->json('error.message', 'Connection failed'),
            ];
        } catch (\Exception $e) {
            Log::error('WhatsApp connection test failed', [
                'account_id' => $accountId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage(),
            ];
        }
    }

    public function disconnectAccount(int $accountId): bool
    {
        $account = WhatsappAccount::findOrFail($accountId);

        return $account->update([
            'connection_status' => 'disconnected',
            'permanent_access_token' => null,
            'meta_app_secret' => null,
        ]);
    }

    public function syncContacts(int $accountId): array
    {
        $account = WhatsappAccount::findOrFail($accountId);
        $crmContacts = Contact::whereNotNull('mobile')->get();

        $synced = 0;
        $skipped = 0;

        foreach ($crmContacts as $contact) {
            $phone = $this->normalizePhoneNumber($contact->mobile);

            if (WhatsappContact::where('whatsapp_account_id', $accountId)
                ->where('phone', $phone)
                ->exists()) {
                $skipped++;
                continue;
            }

            WhatsappContact::create([
                'whatsapp_account_id' => $accountId,
                'contact_id' => $contact->id,
                'phone' => $phone,
                'whatsapp_number' => $phone,
                'name' => $contact->name ?? $contact->mobile,
                'status' => 'active',
                'tags' => [],
                'opt_in' => false,
            ]);

            $synced++;
        }

        $account->update(['last_sync_at' => now()]);

        return [
            'synced' => $synced,
            'skipped' => $skipped,
            'total' => $crmContacts->count(),
        ];
    }

    public function sendMessage(int $accountId, int $contactId, int $templateId, array $variables = []): array
    {
        $account = WhatsappAccount::findOrFail($accountId);
        $contact = WhatsappContact::findOrFail($contactId);
        $template = WhatsappTemplate::findOrFail($templateId);

        if ($template->status !== 'approved') {
            throw new \RuntimeException('Template is not approved for sending');
        }

        $messagePayload = [
            'messaging_product' => 'whatsapp',
            'to' => $contact->phone,
            'type' => 'template',
            'template' => [
                'name' => $template->name,
                'language' => ['code' => 'en_US'],
                'components' => $this->buildTemplateComponents($template, $variables),
            ],
        ];

        try {
            $response = Http::withToken($account->permanent_access_token)
                ->post("https://graph.facebook.com/v18.0/{$account->phone_number_id}/messages", $messagePayload);

            if ($response->successful()) {
                $responseData = $response->json();
                $messageId = $responseData['messages'][0]['id'] ?? null;

                $message = WhatsappMessage::create([
                    'whatsapp_account_id' => $accountId,
                    'contact_id' => $contactId,
                    'template_id' => $templateId,
                    'whatsapp_message_id' => $messageId,
                    'direction' => 'outbound',
                    'message_type' => 'template',
                    'content' => $this->renderTemplate($template, $variables),
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                $this->updateConversation($contactId, $message);

                return [
                    'success' => true,
                    'message' => $message,
                ];
            }

            throw new \RuntimeException($response->json('error.message', 'Failed to send message'));
        } catch (\Exception $e) {
            Log::error('WhatsApp message send failed', [
                'account_id' => $accountId,
                'contact_id' => $contactId,
                'error' => $e->getMessage(),
            ]);

            WhatsappMessage::create([
                'whatsapp_account_id' => $accountId,
                'contact_id' => $contactId,
                'template_id' => $templateId,
                'direction' => 'outbound',
                'message_type' => 'template',
                'content' => $this->renderTemplate($template, $variables),
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'failed_at' => now(),
            ]);

            throw $e;
        }
    }

    public function sendBulkCampaign(int $campaignId): array
    {
        $campaign = WhatsappCampaign::with(['template', 'account'])->findOrFail($campaignId);

        if ($campaign->status !== 'draft' && $campaign->status !== 'scheduled') {
            throw new \RuntimeException('Campaign cannot be started');
        }

        $campaign->update([
            'status' => 'running',
            'started_at' => now(),
        ]);

        $contacts = $this->getCampaignContacts($campaign);
        $sent = 0;
        $failed = 0;

        foreach ($contacts as $contact) {
            try {
                $this->sendMessage(
                    $campaign->whatsapp_account_id,
                    $contact->id,
                    $campaign->template_id,
                    $this->prepareVariables($contact, $campaign)
                );
                $sent++;
            } catch (\Exception $e) {
                $failed++;
                Log::error('Bulk campaign message failed', [
                    'campaign_id' => $campaignId,
                    'contact_id' => $contact->id,
                    'error' => $e->getMessage(),
                ]);
            }

            $campaign->update([
                'total_sent' => $sent,
                'total_failed' => $failed,
            ]);

            usleep(100000);
        }

        $campaign->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return [
            'sent' => $sent,
            'failed' => $failed,
            'total' => $contacts->count(),
        ];
    }

    public function getConversationMessages(int $contactId): \Illuminate\Database\Eloquent\Collection
    {
        return WhatsappMessage::where('contact_id', $contactId)
            ->with('contact')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function markAsRead(array $messageIds): bool
    {
        return WhatsappMessage::whereIn('id', $messageIds)
            ->update([
                'status' => 'read',
                'read_at' => now(),
            ]);
    }

    public function getAnalytics(int $accountId, ?string $dateRange = null): array
    {
        $query = WhatsappMessage::where('whatsapp_account_id', $accountId);

        if ($dateRange) {
            $query->where('created_at', '>=', $this->parseDateRange($dateRange));
        }

        $messages = $query->get();

        return [
            'total_sent' => $messages->where('direction', 'outbound')->count(),
            'total_received' => $messages->where('direction', 'inbound')->count(),
            'delivered' => $messages->where('status', 'delivered')->count(),
            'read' => $messages->where('status', 'read')->count(),
            'failed' => $messages->where('status', 'failed')->count(),
            'delivery_rate' => $this->calculateRate(
                $messages->where('direction', 'outbound')->count(),
                $messages->where('status', 'delivered')->count() + $messages->where('status', 'read')->count()
            ),
            'read_rate' => $this->calculateRate(
                $messages->where('status', 'delivered')->count(),
                $messages->where('status', 'read')->count()
            ),
            'messages_by_day' => $messages->groupBy(function ($msg) {
                return $msg->created_at->format('Y-m-d');
            })->map(fn ($msgs) => $msgs->count()),
            'messages_by_type' => $messages->groupBy('message_type')->map(fn ($msgs) => $msgs->count()),
        ];
    }

    public function handleWebhook(array $payload): array
    {
        $eventType = $payload['entry'][0]['changes'][0]['value'] ?? null;

        if (!$eventType) {
            return ['processed' => false, 'message' => 'Invalid payload'];
        }

        $change = $payload['entry'][0]['changes'][0]['value'];
        $account = $this->findAccountByPayload($change);

        if (!$account) {
            return ['processed' => false, 'message' => 'Account not found'];
        }

        WhatsappWebhook::create([
            'whatsapp_account_id' => $account->id,
            'event_type' => $change['field'] ?? 'unknown',
            'payload' => $payload,
            'status' => 'processed',
            'processed_at' => now(),
        ]);

        if (isset($change['messages'])) {
            $this->processIncomingMessage($account, $change['messages'][0]);
        }

        if (isset($change['statuses'])) {
            $this->processStatusUpdate($account, $change['statuses'][0]);
        }

        return ['processed' => true];
    }

    private function normalizePhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        if (!str_starts_with($phone, '+')) {
            $phone = '+880' . ltrim($phone, '0');
        }

        return $phone;
    }

    private function buildTemplateComponents(WhatsappTemplate $template, array $variables): array
    {
        $components = [];

        if (!empty($variables)) {
            $parameters = array_map(fn ($var) => ['type' => 'text', 'text' => $var], $variables);
            $components[] = [
                'type' => 'body',
                'parameters' => $parameters,
            ];
        }

        return $components;
    }

    private function renderTemplate(WhatsappTemplate $template, array $variables): string
    {
        $content = $template->body_text ?? '';

        foreach ($variables as $index => $value) {
            $content = str_replace('{{' . ($index + 1) . '}}', $value, $content);
        }

        return $content;
    }

    private function updateConversation(int $contactId, WhatsappMessage $message): void
    {
        $conversation = WhatsappConversation::firstOrCreate(
            ['contact_id' => $contactId],
            [
                'whatsapp_account_id' => $message->whatsapp_account_id,
                'last_message_at' => now(),
                'last_message_preview' => Str::limit($message->content, 100),
                'unread_count' => 0,
            ]
        );

        $conversation->update([
            'last_message_at' => now(),
            'last_message_preview' => Str::limit($message->content, 100),
        ]);
    }

    private function getCampaignContacts(WhatsappCampaign $campaign): \Illuminate\Database\Eloquent\Collection
    {
        $query = WhatsappContact::where('whatsapp_account_id', $campaign->whatsapp_account_id)
            ->where('opt_in', true);

        $filters = $campaign->audience_filter ?? [];

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['tags'])) {
            $query->whereJsonContains('tags', $filters['tags']);
        }

        return $query->get();
    }

    private function prepareVariables(WhatsappContact $contact, WhatsappCampaign $campaign): array
    {
        return [
            $contact->name ?? 'Customer',
        ];
    }

    private function parseDateRange(string $dateRange): \Carbon\Carbon
    {
        return match ($dateRange) {
            'today' => now()->startOfDay(),
            'yesterday' => now()->subDay()->startOfDay(),
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => now()->subDays(30),
        };
    }

    private function calculateRate(int $total, int $count): float
    {
        return $total > 0 ? round(($count / $total) * 100, 2) : 0;
    }

    private function findAccountByPayload(array $change): ?WhatsappAccount
    {
        $phoneNumberId = $change['metadata']['phone_number_id'] ?? null;

        if ($phoneNumberId) {
            return WhatsappAccount::where('phone_number_id', $phoneNumberId)->first();
        }

        return null;
    }

    private function processIncomingMessage(WhatsappAccount $account, array $messageData): void
    {
        $contact = WhatsappContact::where('whatsapp_account_id', $account->id)
            ->where('phone', '+' . $messageData['from'])
            ->first();

        if ($contact) {
            WhatsappMessage::create([
                'whatsapp_account_id' => $account->id,
                'contact_id' => $contact->id,
                'whatsapp_message_id' => $messageData['id'],
                'direction' => 'inbound',
                'message_type' => $messageData['type'] ?? 'text',
                'content' => $messageData['text']['body'] ?? '',
                'status' => 'received',
                'sent_at' => now(),
            ]);

            $contact->update(['last_message_at' => now()]);
        }
    }

    private function processStatusUpdate(WhatsappAccount $account, array $statusData): void
    {
        $message = WhatsappMessage::where('whatsapp_message_id', $statusData['id'])->first();

        if ($message) {
            $status = match ($statusData['status']) {
                'sent' => 'sent',
                'delivered' => 'delivered',
                'read' => 'read',
                'failed' => 'failed',
                default => $statusData['status'],
            };

            $update = ['status' => $status];

            if ($status === 'delivered') {
                $update['delivered_at'] = now();
            } elseif ($status === 'read') {
                $update['read_at'] = now();
            } elseif ($status === 'failed') {
                $update['failed_at'] = now();
                $update['error_message'] = $statusData['errors'][0]['message'] ?? null;
            }

            $message->update($update);
        }
    }
}
