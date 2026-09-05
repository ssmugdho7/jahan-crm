<?php

declare(strict_types=1);

namespace App\Http\Controllers\WhatsApp;

use App\Http\Controllers\Controller;
use App\Models\WhatsappTemplate;
use App\Services\WhatsApp\TemplateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappTemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $templates = WhatsappTemplate::where('whatsapp_account_id', $accountId)
            ->latest()
            ->get();

        return Inertia::render('whatsapp/templates', [
            'templates' => $templates,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('whatsapp/templates', [
            'templates' => [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|regex:/^[a-z0-9_]+$/',
            'category' => 'required|string|in:marketing,utility,authentication',
            'body_text' => 'required|string|max:1024',
            'header_text' => 'nullable|string|max:500',
            'footer_text' => 'nullable|string|max:60',
            'buttons' => 'nullable|array',
            'buttons.*.type' => 'required|string|in:quick_reply,url',
            'buttons.*.text' => 'required|string|max:25',
            'buttons.*.url' => 'nullable|string|max:2000',
        ]);

        $accountId = $request->user()->whatsappAccounts->first()?->id;
        $validated['whatsapp_account_id'] = $accountId;

        $service = app(TemplateService::class);
        $service->create($validated);

        return redirect()->route('whatsapp.templates')
            ->with('success', 'Template created');
    }

    public function show(int $id): Response
    {
        $template = WhatsappTemplate::findOrFail($id);

        return Inertia::render('whatsapp/templates', [
            'templates' => [$template],
        ]);
    }

    public function edit(int $id): Response
    {
        $template = WhatsappTemplate::findOrFail($id);

        return Inertia::render('whatsapp/templates', [
            'templates' => [$template],
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255|regex:/^[a-z0-9_]+$/',
            'category' => 'nullable|string|in:marketing,utility,authentication',
            'body_text' => 'nullable|string|max:1024',
            'header_text' => 'nullable|string|max:500',
            'footer_text' => 'nullable|string|max:60',
            'buttons' => 'nullable|array',
            'buttons.*.type' => 'required|string|in:quick_reply,url',
            'buttons.*.text' => 'required|string|max:25',
            'buttons.*.url' => 'nullable|string|max:2000',
        ]);

        $service = app(TemplateService::class);
        $service->update($id, $validated);

        return back()->with('success', 'Template updated');
    }

    public function destroy(int $id): RedirectResponse
    {
        $template = WhatsappTemplate::findOrFail($id);

        if (in_array($template->status, ['approved', 'pending'])) {
            return back()->withErrors(['template' => 'Cannot delete approved or pending templates']);
        }

        $template->delete();

        return back()->with('success', 'Template deleted');
    }

    public function preview(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'template_id' => 'required|exists:whatsapp_templates,id',
            'variables' => 'nullable|array',
            'variables.*' => 'string',
        ]);

        $service = app(TemplateService::class);
        $result = $service->render(
            $validated['template_id'],
            $validated['variables'] ?? []
        );

        return response()->json($result);
    }
}
