<?php

declare(strict_types=1);

namespace App\Http\Controllers\WhatsApp;

use App\Http\Controllers\Controller;
use App\Models\WhatsappAccount;
use App\Models\WhatsappCampaign;
use App\Models\WhatsappContact;
use App\Models\WhatsappMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $stats = $this->getStats($accountId);
        $chartData = $this->getChartData($accountId);
        $recentCampaigns = $this->getRecentCampaigns($accountId);
        $recentMessages = $this->getRecentMessages($accountId);

        return Inertia::render('whatsapp/dashboard', [
            'stats' => $stats,
            'chartData' => $chartData,
            'recentCampaigns' => $recentCampaigns,
            'recentMessages' => $recentMessages,
        ]);
    }

    private function getStats(?int $accountId): array
    {
        if (!$accountId) {
            return [
                'connectedNumber' => 'N/A',
                'totalContacts' => 0,
                'totalCampaigns' => 0,
                'messagesSentToday' => 0,
                'delivered' => 0,
                'read' => 0,
                'failed' => 0,
                'replyRate' => 0,
                'conversionRate' => 0,
                'revenueGenerated' => 0,
            ];
        }

        $account = \App\Models\WhatsappAccount::find($accountId);

        $totalContacts = WhatsappContact::where('whatsapp_account_id', $accountId)->count();

        $totalMessagesSent = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('direction', 'outbound')
            ->count();

        $deliveredMessages = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('direction', 'outbound')
            ->where('status', 'delivered')
            ->count();

        $readMessages = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('status', 'read')
            ->count();

        $failedMessages = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('status', 'failed')
            ->count();

        $inboundMessages = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('direction', 'inbound')
            ->count();

        $messagesSentToday = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('direction', 'outbound')
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $totalCampaigns = WhatsappCampaign::where('whatsapp_account_id', $accountId)->count();

        $replyRate = $totalMessagesSent > 0
            ? round(($inboundMessages / $totalMessagesSent) * 100, 1)
            : 0;

        return [
            'connectedNumber' => $account->phone_number ?? 'N/A',
            'totalContacts' => $totalContacts,
            'totalCampaigns' => $totalCampaigns,
            'messagesSentToday' => $messagesSentToday,
            'delivered' => $deliveredMessages,
            'read' => $readMessages,
            'failed' => $failedMessages,
            'replyRate' => $replyRate,
            'conversionRate' => 0,
            'revenueGenerated' => 0,
        ];
    }

    private function getChartData(?int $accountId): array
    {
        if (!$accountId) {
            return [
                'daily' => [],
                'delivery' => [],
                'campaigns' => [],
            ];
        }

        $dailyMessages = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN direction = "outbound" THEN 1 ELSE 0 END) as sent'),
                DB::raw('SUM(CASE WHEN status = "delivered" THEN 1 ELSE 0 END) as delivered'),
                DB::raw('SUM(CASE WHEN status = "read" THEN 1 ELSE 0 END) as `read`'),
                DB::raw('SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        $totalOutbound = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('direction', 'outbound')
            ->count();
        $totalDelivered = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('status', 'delivered')
            ->count();
        $totalRead = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('status', 'read')
            ->count();
        $totalFailed = WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->where('status', 'failed')
            ->count();

        $delivery = [];
        if ($totalDelivered > 0) $delivery[] = ['name' => 'Delivered', 'value' => $totalDelivered];
        if ($totalRead > 0) $delivery[] = ['name' => 'Read', 'value' => $totalRead];
        if ($totalFailed > 0) $delivery[] = ['name' => 'Failed', 'value' => $totalFailed];

        $campaigns = WhatsappCampaign::where('whatsapp_account_id', $accountId)
            ->select('name', 'total_sent as value')
            ->orderByDesc('total_sent')
            ->limit(10)
            ->get()
            ->toArray();

        return [
            'daily' => $dailyMessages,
            'delivery' => $delivery,
            'campaigns' => $campaigns,
        ];
    }

    private function getRecentCampaigns(?int $accountId): array
    {
        if (!$accountId) {
            return [];
        }

        return WhatsappCampaign::where('whatsapp_account_id', $accountId)
            ->select('id', 'name', 'status', 'total_sent as sent', 'total_delivered as delivered', 'total_read as read', 'total_failed as clicked')
            ->latest()
            ->limit(5)
            ->get()
            ->toArray();
    }

    private function getRecentMessages(?int $accountId): array
    {
        if (!$accountId) {
            return [];
        }

        return WhatsappMessage::where('whatsapp_account_id', $accountId)
            ->with('contact:id,name,phone')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($msg) => [
                'id' => $msg->id,
                'contact_name' => $msg->contact->name ?? 'Unknown',
                'phone_number' => $msg->contact->phone ?? '',
                'message' => $msg->content ?? '',
                'status' => $msg->status,
                'direction' => $msg->direction,
                'created_at' => $msg->created_at,
            ])
            ->toArray();
    }
}
