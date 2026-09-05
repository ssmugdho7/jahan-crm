<?php

declare(strict_types=1);

namespace App\Http\Controllers\WhatsApp;

use App\Http\Controllers\Controller;
use App\Models\WhatsappMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $query = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->with('contact:id,name,phone')
            ->with('template:id,name')
            ->with('campaign:id,name');

        if ($direction = $request->get('direction')) {
            $query->where('direction', $direction);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->get('type')) {
            $query->where('message_type', $type);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%");
            });
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $perPage = $request->get('per_page', 20);
        $paginator = $query->latest()->paginate($perPage);

        $stats = [
            'total' => $paginator->total(),
            'sent' => WhatsappMessage::where('whatsapp_account_id', $accountId)->where('direction', 'outbound')->count(),
            'delivered' => WhatsappMessage::where('whatsapp_account_id', $accountId)->where('status', 'delivered')->count(),
            'read' => WhatsappMessage::where('whatsapp_account_id', $accountId)->where('status', 'read')->count(),
            'failed' => WhatsappMessage::where('whatsapp_account_id', $accountId)->where('status', 'failed')->count(),
            'inbound' => WhatsappMessage::where('whatsapp_account_id', $accountId)->where('direction', 'inbound')->count(),
            'outbound' => WhatsappMessage::where('whatsapp_account_id', $accountId)->where('direction', 'outbound')->count(),
        ];

        $pagination = [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];

        return Inertia::render('whatsapp/messages', [
            'messages' => $paginator->items(),
            'stats' => $stats,
            'pagination' => $pagination,
        ]);
    }

    public function show(int $id): Response
    {
        $message = WhatsappMessage::with(['contact', 'template', 'campaign'])
            ->findOrFail($id);

        return Inertia::render('whatsapp/messages', [
            'messages' => [$message],
            'stats' => ['total' => 1, 'sent' => 0, 'delivered' => 0, 'read' => 0, 'failed' => 0, 'inbound' => 0, 'outbound' => 0],
            'pagination' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 20, 'total' => 1],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $query = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->with('contact:id,name,phone');

        if ($direction = $request->get('direction')) {
            $query->where('direction', $direction);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $messages = $query->latest()->get();

        return response()->streamDownload(function () use ($messages) {
            $stream = fopen('php://output', 'w');
            fwrite($stream, "\xEF\xBB\xBF");

            fputcsv($stream, ['#', 'Direction', 'Type', 'Contact', 'Phone', 'Content', 'Status', 'Template', 'Sent At']);

            foreach ($messages as $i => $message) {
                fputcsv($stream, [
                    $i + 1,
                    ucfirst($message->direction),
                    ucfirst($message->message_type),
                    $message->contact->name ?? '',
                    $message->contact->phone ?? '',
                    $message->content ?? '',
                    ucfirst($message->status),
                    $message->template->name ?? '',
                    $message->sent_at?->format('Y-m-d H:i:s') ?? '',
                ]);
            }

            fclose($stream);
        }, 'whatsapp-messages.csv');
    }
}
