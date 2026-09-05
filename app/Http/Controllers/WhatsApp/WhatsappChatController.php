<?php

declare(strict_types=1);

namespace App\Http\Controllers\WhatsApp;

use App\Http\Controllers\Controller;
use App\Models\WhatsappContact;
use App\Models\WhatsappConversation;
use App\Models\WhatsappMessage;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappChatController extends Controller
{
    public function __construct(
        private WhatsAppService $whatsappService
    ) {}

    public function index(Request $request): Response
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $conversations = WhatsappConversation::where('whatsapp_account_id', $accountId)
            ->with('contact:id,name,phone,whatsapp_number,status')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(fn ($conv) => [
                'id' => $conv->id,
                'contact' => [
                    'id' => $conv->contact->id,
                    'name' => $conv->contact->name ?? 'Unknown',
                    'phone' => $conv->contact->phone ?? '',
                    'whatsapp_number' => $conv->contact->whatsapp_number ?? '',
                    'avatar' => null,
                    'status' => $conv->contact->status ?? 'active',
                ],
                'last_message' => $conv->last_message_preview ?? '',
                'last_message_at' => $conv->last_message_at ?? $conv->updated_at,
                'unread_count' => $conv->unread_count ?? 0,
                'is_archived' => $conv->is_archived ?? false,
                'is_pinned' => $conv->is_pinned ?? false,
            ])
            ->toArray();

        return Inertia::render('whatsapp/chat', [
            'conversations' => $conversations,
            'activeConversation' => null,
            'contactInfo' => null,
        ]);
    }

    public function show(Request $request, int $contactId): Response
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $contact = WhatsappContact::where('whatsapp_account_id', $accountId)
            ->with('contact:id,name,mobile,email')
            ->findOrFail($contactId);

        $messages = WhatsappMessage::where('contact_id', $contactId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($msg) => [
                'id' => $msg->id,
                'direction' => $msg->direction,
                'message_type' => $msg->message_type ?? 'text',
                'content' => $msg->content ?? '',
                'media_url' => $msg->media_url ?? null,
                'caption' => $msg->caption ?? null,
                'status' => $msg->status,
                'sent_at' => $msg->sent_at ?? $msg->created_at,
                'delivered_at' => $msg->delivered_at,
                'read_at' => $msg->read_at,
            ])
            ->toArray();

        $conversation = WhatsappConversation::where('whatsapp_account_id', $accountId)
            ->where('contact_id', $contactId)
            ->first();

        if ($conversation && $conversation->unread_count > 0) {
            $conversation->update(['unread_count' => 0]);
        }

        $activeConversation = [
            'id' => $conversation?->id ?? 0,
            'contact' => [
                'id' => $contact->id,
                'name' => $contact->name ?? 'Unknown',
                'phone' => $contact->phone ?? '',
                'whatsapp_number' => $contact->whatsapp_number ?? '',
                'email' => $contact->contact->email ?? null,
                'avatar' => null,
                'status' => $contact->status ?? 'active',
                'tags' => $contact->tags ?? [],
                'total_orders' => 0,
                'total_purchase' => 0,
                'last_order_date' => null,
            ],
            'messages' => $messages,
            'unread_count' => $conversation?->unread_count ?? 0,
        ];

        $contactInfo = [
            'name' => $contact->name ?? 'Unknown',
            'phone' => $contact->phone ?? '',
            'email' => $contact->contact->email ?? null,
            'tags' => $contact->tags ?? [],
            'total_orders' => 0,
            'total_purchase' => 0,
            'last_order_date' => null,
        ];

        $conversations = $this->getConversations($accountId);

        return Inertia::render('whatsapp/chat', [
            'conversations' => $conversations,
            'activeConversation' => $activeConversation,
            'contactInfo' => $contactInfo,
        ]);
    }

    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'contact_id' => 'required|exists:whatsapp_contacts,id',
            'template_id' => 'required|exists:whatsapp_templates,id',
            'variables' => 'nullable|array',
            'variables.*' => 'string',
        ]);

        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $this->whatsappService->sendMessage(
            $accountId,
            $validated['contact_id'],
            $validated['template_id'],
            $validated['variables'] ?? []
        );

        return back()->with('success', 'Message sent');
    }

    public function markRead(Request $request, int $contactId): RedirectResponse
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $unreadMessages = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('contact_id', $contactId)
            ->where('direction', 'inbound')
            ->where('status', '!=', 'read')
            ->pluck('id')
            ->toArray();

        if (!empty($unreadMessages)) {
            $this->whatsappService->markAsRead($unreadMessages);
        }

        return back()->with('success', 'Conversation marked as read');
    }

    public function archive(Request $request, int $contactId): RedirectResponse
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $conversation = WhatsappConversation::where('whatsapp_account_id', $accountId)
            ->where('contact_id', $contactId)
            ->first();

        if ($conversation) {
            $conversation->update(['is_archived' => true]);
        }

        return back()->with('success', 'Conversation archived');
    }

    public function search(Request $request): Response
    {
        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $accountId = $request->user()->whatsappAccounts->first()?->id;
        $query = $request->input('query');

        $conversations = WhatsappConversation::where('whatsapp_account_id', $accountId)
            ->whereHas('contact', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('phone', 'like', "%{$query}%");
            })
            ->with('contact:id,name,phone,whatsapp_number,status')
            ->orderBy('last_message_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn ($conv) => [
                'id' => $conv->id,
                'contact' => [
                    'id' => $conv->contact->id,
                    'name' => $conv->contact->name ?? 'Unknown',
                    'phone' => $conv->contact->phone ?? '',
                    'whatsapp_number' => $conv->contact->whatsapp_number ?? '',
                    'avatar' => null,
                    'status' => $conv->contact->status ?? 'active',
                ],
                'last_message' => $conv->last_message_preview ?? '',
                'last_message_at' => $conv->last_message_at ?? $conv->updated_at,
                'unread_count' => $conv->unread_count ?? 0,
                'is_archived' => $conv->is_archived ?? false,
                'is_pinned' => $conv->is_pinned ?? false,
            ])
            ->toArray();

        return Inertia::render('whatsapp/chat', [
            'conversations' => $conversations,
            'activeConversation' => null,
            'contactInfo' => null,
        ]);
    }

    private function getConversations(?int $accountId): array
    {
        return WhatsappConversation::where('whatsapp_account_id', $accountId)
            ->with('contact:id,name,phone,whatsapp_number,status')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(fn ($conv) => [
                'id' => $conv->id,
                'contact' => [
                    'id' => $conv->contact->id,
                    'name' => $conv->contact->name ?? 'Unknown',
                    'phone' => $conv->contact->phone ?? '',
                    'whatsapp_number' => $conv->contact->whatsapp_number ?? '',
                    'avatar' => null,
                    'status' => $conv->contact->status ?? 'active',
                ],
                'last_message' => $conv->last_message_preview ?? '',
                'last_message_at' => $conv->last_message_at ?? $conv->updated_at,
                'unread_count' => $conv->unread_count ?? 0,
                'is_archived' => $conv->is_archived ?? false,
                'is_pinned' => $conv->is_pinned ?? false,
            ])
            ->toArray();
    }
}
