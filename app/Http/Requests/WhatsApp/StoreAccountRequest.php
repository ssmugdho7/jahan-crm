<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'country_code' => 'nullable|string|max:10',
            'whatsapp_business_account_id' => 'required|string|max:255',
            'phone_number_id' => 'required|string|max:255',
            'meta_app_id' => 'nullable|string|max:255',
            'meta_app_secret' => 'required|string|max:255',
            'permanent_access_token' => 'required|string',
            'business_website' => 'nullable|url|max:255',
            'business_email' => 'nullable|email|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'business_name.required' => 'Business name is required',
            'phone_number.required' => 'Phone number is required',
            'whatsapp_business_account_id.required' => 'WhatsApp Business Account ID is required',
            'phone_number_id.required' => 'Phone Number ID is required',
            'meta_app_secret.required' => 'Meta App Secret is required',
            'permanent_access_token.required' => 'Permanent Access Token is required',
        ];
    }
}
