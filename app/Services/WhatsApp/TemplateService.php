<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Models\WhatsappAccount;
use App\Models\WhatsappTemplate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TemplateService
{
    public function create(array $data): WhatsappTemplate
    {
        $variables = $this->extractVariables($data['body_text'] ?? '');

        return WhatsappTemplate::create([
            'whatsapp_account_id' => $data['whatsapp_account_id'],
            'name' => $data['name'],
            'category' => $data['category'] ?? 'marketing',
            'body_text' => $data['body_text'] ?? '',
            'header_text' => $data['header_text'] ?? null,
            'footer_text' => $data['footer_text'] ?? null,
            'variables' => $variables,
            'buttons' => $data['buttons'] ?? [],
            'status' => 'draft',
        ]);
    }

    public function update(int $id, array $data): WhatsappTemplate
    {
        $template = WhatsappTemplate::findOrFail($id);

        if (in_array($template->status, ['approved', 'pending'])) {
            throw new \RuntimeException('Cannot edit approved or pending templates');
        }

        $updateData = collect($data)->only([
            'name',
            'category',
            'body_text',
            'header_text',
            'footer_text',
            'buttons',
        ])->filter()->toArray();

        if (isset($updateData['body_text'])) {
            $updateData['variables'] = $this->extractVariables($updateData['body_text']);
        }

        $template->update($updateData);

        return $template->fresh();
    }

    public function render(int $templateId, array $variables = []): array
    {
        $template = WhatsappTemplate::findOrFail($templateId);

        $preview = $this->replaceVariables($template->body_text ?? '', $variables);

        return [
            'template' => $template,
            'preview' => $preview,
        ];
    }

    public function submitForApproval(int $id): array
    {
        $template = WhatsappTemplate::findOrFail($id);

        if ($template->status === 'approved') {
            throw new \RuntimeException('Template is already approved');
        }

        $account = $template->account;

        try {
            $response = Http::withToken($account->permanent_access_token)
                ->post("https://graph.facebook.com/v18.0/{$account->whatsapp_business_account_id}/message_templates", [
                    'name' => $template->name,
                    'language' => 'en_US',
                    'category' => strtoupper($template->category),
                    'components' => $this->formatComponentsForMeta($template),
                ]);

            if ($response->successful()) {
                $template->update([
                    'status' => 'pending',
                    'whatsapp_template_id' => $response->json('id'),
                ]);

                return [
                    'success' => true,
                    'message' => 'Template submitted for approval',
                    'template_id' => $response->json('id'),
                ];
            }

            $error = $response->json('error.message', 'Submission failed');

            return [
                'success' => false,
                'message' => $error,
            ];
        } catch (\Exception $e) {
            Log::error('Template approval submission failed', [
                'template_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Submission failed: ' . $e->getMessage(),
            ];
        }
    }

    private function extractVariables(string $bodyText): array
    {
        $variables = [];

        preg_match_all('/\{\{(\d+)\}\}/', $bodyText, $matches);

        if (!empty($matches[1])) {
            $variables = array_map(fn ($v) => (int) $v, array_unique($matches[1]));
            sort($variables);
        }

        return $variables;
    }

    private function buildPreview(WhatsappTemplate $template, array $variables): string
    {
        return $this->replaceVariables($template->body_text ?? '', $variables);
    }

    private function replaceVariables(string $text, array $variables): string
    {
        foreach ($variables as $index => $value) {
            $text = str_replace('{{' . ($index + 1) . '}}', (string) $value, $text);
        }

        return $text;
    }

    private function formatComponentsForMeta(WhatsappTemplate $template): array
    {
        $components = [];

        if (!empty($template->header_text)) {
            $components[] = [
                'type' => 'HEADER',
                'format' => 'TEXT',
                'text' => $template->header_text,
            ];
        }

        $bodyComponent = [
            'type' => 'BODY',
            'text' => $template->body_text ?? '',
        ];

        if (!empty($template->variables)) {
            $bodyComponent['example'] = [
                'body_text' => [
                    array_map(fn ($i) => "Example " . $i, $template->variables),
                ],
            ];
        }

        $components[] = $bodyComponent;

        if (!empty($template->footer_text)) {
            $components[] = [
                'type' => 'FOOTER',
                'text' => $template->footer_text,
            ];
        }

        foreach ($template->buttons as $button) {
            $components[] = [
                'type' => 'BUTTONS',
                'buttons' => [
                    [
                        'type' => strtoupper($button['type'] ?? 'quick_reply'),
                        'text' => $button['text'] ?? '',
                        ...(isset($button['url']) ? ['url' => $button['url']] : []),
                    ],
                ],
            ];
        }

        return $components;
    }
}
