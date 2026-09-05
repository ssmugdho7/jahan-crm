<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'whatsapp_template_id' => 'required|exists:whatsapp_templates,id',
            'audience_filter' => 'nullable|array',
            'audience_filter.status' => 'nullable|string|in:active,inactive,vip',
            'audience_filter.tags' => 'nullable|array',
            'audience_filter.opt_in' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Campaign name is required',
            'whatsapp_template_id.required' => 'Template is required',
            'whatsapp_template_id.exists' => 'Selected template does not exist',
        ];
    }
}
