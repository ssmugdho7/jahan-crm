<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'schedule_at' => 'required|date|after:now',
        ];
    }

    public function messages(): array
    {
        return [
            'schedule_at.required' => 'Schedule date is required',
            'schedule_at.date' => 'Invalid date format',
            'schedule_at.after' => 'Schedule date must be in the future',
        ];
    }
}
