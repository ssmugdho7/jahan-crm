<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'nullable|string|in:active,inactive,vip',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Status must be active, inactive, or vip',
            'tags.array' => 'Tags must be an array',
            'tags.*.max' => 'Tag must not exceed 50 characters',
        ];
    }
}
