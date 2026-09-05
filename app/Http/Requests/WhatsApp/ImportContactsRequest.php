<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;

class ImportContactsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contact_ids' => 'required|array',
            'contact_ids.*' => 'exists:contacts,id',
        ];
    }

    public function messages(): array
    {
        return [
            'contact_ids.required' => 'Please select contacts to import',
            'contact_ids.array' => 'Invalid contact selection',
            'contact_ids.*.exists' => 'One or more selected contacts do not exist',
        ];
    }
}
