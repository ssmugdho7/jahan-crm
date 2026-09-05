<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contact_id' => 'required|exists:whatsapp_contacts,id',
            'template_id' => 'required|exists:whatsapp_templates,id',
            'variables' => 'nullable|array',
            'variables.*' => 'string',
        ];
    }

    public function messages(): array
    {
        return [
            'contact_id.required' => 'Contact is required',
            'contact_id.exists' => 'Selected contact does not exist',
            'template_id.required' => 'Template is required',
            'template_id.exists' => 'Selected template does not exist',
        ];
    }
}
