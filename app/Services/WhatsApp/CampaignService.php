<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Models\WhatsappCampaign;
use App\Models\WhatsappContact;
use App\Models\WhatsappTemplate;
use Illuminate\Support\Facades\DB;

class CampaignService
{
    public function create(array $data): WhatsappCampaign
    {
        $contacts = $this->getFilteredContacts($data['audience_filter'] ?? []);

        return WhatsappCampaign::create([
            'whatsapp_account_id' => $data['whatsapp_account_id'],
            'template_id' => $data['template_id'] ?? null,
            'name' => $data['name'],
            'campaign_type' => $data['campaign_type'] ?? 'discount',
            'audience_filter' => $data['audience_filter'] ?? [],
        ]);
    }

    public function update(int $id, array $data): WhatsappCampaign
    {
        $campaign = WhatsappCampaign::findOrFail($id);

        if ($campaign->status !== 'draft') {
            throw new \RuntimeException('Only draft campaigns can be edited');
        }

        $updateData = collect($data)->only([
            'name',
            'template_id',
            'campaign_type',
            'audience_filter',
        ])->filter()->toArray();

        if (isset($updateData['audience_filter'])) {
            $this->getFilteredContacts($updateData['audience_filter']);
        }

        $campaign->update($updateData);

        return $campaign->fresh();
    }

    public function schedule(int $id, string $scheduleAt): WhatsappCampaign
    {
        $campaign = WhatsappCampaign::findOrFail($id);

        if ($campaign->status !== 'draft') {
            throw new \RuntimeException('Only draft campaigns can be scheduled');
        }

        $scheduleDate = now()->parse($scheduleAt);

        if ($scheduleDate->isPast()) {
            throw new \InvalidArgumentException('Schedule time must be in the future');
        }

        $campaign->update([
            'status' => 'scheduled',
            'schedule_at' => $scheduleDate,
        ]);

        return $campaign->fresh();
    }

    public function start(int $id): array
    {
        $campaign = WhatsappCampaign::findOrFail($id);

        if (!in_array($campaign->status, ['draft', 'scheduled'])) {
            throw new \RuntimeException('Campaign cannot be started');
        }

        $whatsappService = app(WhatsAppService::class);

        return $whatsappService->sendBulkCampaign($id);
    }

    public function cancel(int $id): WhatsappCampaign
    {
        $campaign = WhatsappCampaign::findOrFail($id);

        if (!in_array($campaign->status, ['draft', 'scheduled'])) {
            throw new \RuntimeException('Campaign cannot be cancelled');
        }

        $campaign->update([
            'status' => 'cancelled',
            'completed_at' => now(),
        ]);

        return $campaign->fresh();
    }

    public function getStats(int $id): array
    {
        $campaign = WhatsappCampaign::with(['template', 'messages'])->findOrFail($id);

        $messages = $campaign->messages;

        return [
            'campaign' => $campaign,
            'stats' => [
                'total_contacts' => $campaign->total_contacts,
                'sent' => $campaign->total_sent,
                'delivered' => $campaign->total_delivered,
                'read' => $campaign->total_read,
                'failed' => $campaign->total_failed,
                'delivery_rate' => $campaign->total_sent > 0
                    ? round(($campaign->total_delivered / $campaign->total_sent) * 100, 2)
                    : 0,
                'read_rate' => $campaign->total_delivered > 0
                    ? round(($campaign->total_read / $campaign->total_delivered) * 100, 2)
                    : 0,
            ],
            'messages_by_day' => $messages->groupBy(function ($msg) {
                return $msg->created_at->format('Y-m-d');
            })->map(fn ($msgs) => $msgs->count()),
            'messages_by_status' => $messages->groupBy('status')->map(fn ($msgs) => $msgs->count()),
        ];
    }

    private function getFilteredContacts(array $filter): \Illuminate\Database\Eloquent\Collection
    {
        $query = WhatsappContact::query();

        if (!empty($filter['status'])) {
            $query->where('status', $filter['status']);
        }

        if (!empty($filter['tags'])) {
            foreach ((array) $filter['tags'] as $tag) {
                $query->whereJsonContains('tags', $tag);
            }
        }

        if (!empty($filter['opt_in'])) {
            $query->where('opt_in', true);
        }

        if (!empty($filter['search'])) {
            $query->where(function ($q) use ($filter) {
                $q->where('name', 'like', "%{$filter['search']}%")
                  ->orWhere('phone', 'like', "%{$filter['search']}%");
            });
        }

        return $query->get();
    }
}
