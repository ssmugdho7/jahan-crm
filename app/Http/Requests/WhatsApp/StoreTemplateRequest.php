<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;

class StoreTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|regex:/^[a-z0-9_]+$/',
            'language' => 'required|string|max:10',
            'category' => 'required|string|in:marketing,utility,authentication',
            'components' => 'required|array',
            'components.header' => 'nullable|array',
            'components.header.format' => 'nullable|string|in:text,image,video,document',
            'components.header.text' => 'nullable|string|max:500',
            'components.body' => 'required|array',
            'components.body.text' => 'required|string|max:1024',
            'components.footer' => 'nullable|array',
            'components.footer.text' => 'nullable|string|max:60',
            'buttons' => 'nullable|array',
            'buttons.*.type' => 'required|string|in:quick_reply,url',
            'buttons.*.text' => 'required|string|max:25',
            'buttons.*.url' => 'nullable|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Template name is required',
            'name.regex' => 'Template name must contain only lowercase letters, numbers, and underscores',
            'language.required' => 'Language is required',
            'category.required' => 'Category is required',
            'category.in' => 'Category must be marketing, utility, or authentication',
            'components.body.text.required' => 'Template body text is required',
            'components.body.text.max' => 'Template body must not exceed 1024 characters',
        ];
    }
}
