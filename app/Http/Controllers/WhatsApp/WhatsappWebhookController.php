<?php

declare(strict_types=1);

namespace App\Http\Controllers\WhatsApp;

use App\Http\Controllers\Controller;
use App\Models\WhatsappAccount;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsappWebhookController extends Controller
{
    public function __construct(
        private WhatsAppService $whatsappService
    ) {}

    public function verify(Request $request): JsonResponse
    {
        $mode = $request->input('hub_mode');
        $token = $request->input('hub_verify_token');
        $challenge = $request->input('hub_challenge');

        if ($mode === 'subscribe' && $token) {
            $account = WhatsappAccount::where('webhook_verify_token', $token)->first();

            if ($account) {
                Log::info('Webhook verified', ['account_id' => $account->id]);

                return response()->json((int) $challenge);
            }
        }

        Log::warning('Webhook verification failed', [
            'mode' => $mode,
            'token' => $token,
        ]);

        return response()->json(['error' => 'Verification failed'], 403);
    }

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Webhook received', [
            'type' => $payload['entry'][0]['changes'][0]['value']['field'] ?? 'unknown',
        ]);

        try {
            $result = $this->whatsappService->handleWebhook($payload);

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $payload,
            ]);

            return response()->json(['error' => 'Processing failed'], 500);
        }
    }
}
