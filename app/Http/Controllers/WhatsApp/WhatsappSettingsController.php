<?php

declare(strict_types=1);

namespace App\Http\Controllers\WhatsApp;

use App\Http\Controllers\Controller;
use App\Models\WhatsappAccount;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappSettingsController extends Controller
{
    public function __construct(
        private WhatsAppService $whatsappService
    ) {}

    public function index(): Response
    {
        $account = auth()->user()->whatsappAccounts->first();

        return Inertia::render('whatsapp/settings', [
            'account' => $account,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
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
        ]);

        $this->whatsappService->connectAccount($validated);

        return back()->with('success', 'WhatsApp account connected successfully');
    }

    public function testConnection(Request $request): JsonResponse
    {
        $request->validate([
            'account_id' => 'required|exists:whatsapp_accounts,id',
        ]);

        $result = $this->whatsappService->testConnection($request->input('account_id'));

        return response()->json($result);
    }

    public function disconnect(Request $request): RedirectResponse
    {
        $request->validate([
            'account_id' => 'required|exists:whatsapp_accounts,id',
        ]);

        $this->whatsappService->disconnectAccount($request->input('account_id'));

        return back()->with('success', 'WhatsApp account disconnected');
    }

    public function generateWebhook(Request $request): JsonResponse
    {
        $request->validate([
            'account_id' => 'required|exists:whatsapp_accounts,id',
        ]);

        $account = WhatsappAccount::findOrFail($request->input('account_id'));
        $verifyToken = $account->webhook_verify_token ?? Str::random(32);

        if (!$account->webhook_verify_token) {
            $account->update(['webhook_verify_token' => $verifyToken]);
        }

        $webhookUrl = url("/api/whatsapp/webhook?hub_verify_token={$verifyToken}&hub_mode=subscribe");

        return response()->json([
            'webhook_url' => $webhookUrl,
            'verify_token' => $verifyToken,
            'instructions' => 'Copy this webhook URL to your Meta App Dashboard. The verify token is used for the verification handshake.',
        ]);
    }
}
