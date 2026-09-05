<?php

declare(strict_types=1);

namespace App\Http\Controllers\WhatsApp;

use App\Http\Controllers\Controller;
use App\Models\WhatsappCampaign;
use App\Models\WhatsappContact;
use App\Models\WhatsappMessage;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappAnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $overview = $this->getOverview($accountId);
        $dailyStats = $this->getDailyStats($accountId);
        $campaignStats = $this->getCampaignStats($accountId);
        $topCampaigns = $this->getTopCampaigns($accountId);
        $customerGrowth = $this->getCustomerGrowth($accountId);
        $revenueData = $this->getRevenueData($accountId);

        return Inertia::render('whatsapp/analytics', [
            'overview' => $overview,
            'dailyStats' => $dailyStats,
            'campaignStats' => $campaignStats,
            'topCampaigns' => $topCampaigns,
            'customerGrowth' => $customerGrowth,
            'revenueData' => $revenueData,
        ]);
    }

    private function getOverview(?int $accountId): array
    {
        if (!$accountId) {
            return [
                'totalSent' => 0, 'totalDelivered' => 0, 'totalRead' => 0, 'totalFailed' => 0,
                'deliveryRate' => 0, 'readRate' => 0, 'replyRate' => 0, 'conversionRate' => 0, 'revenueGenerated' => 0,
            ];
        }

        $totalSent = WhatsappMessage::where('whatsapp_account_id', $accountId)->where('direction', 'outbound')->count();
        $totalDelivered = WhatsappMessage::where('whatsapp_account_id', $accountId)->where('status', 'delivered')->count();
        $totalRead = WhatsappMessage::where('whatsapp_account_id', $accountId)->where('status', 'read')->count();
        $totalFailed = WhatsappMessage::where('whatsapp_account_id', $accountId)->where('status', 'failed')->count();
        $totalInbound = WhatsappMessage::where('whatsapp_account_id', $accountId)->where('direction', 'inbound')->count();

        return [
            'totalSent' => $totalSent,
            'totalDelivered' => $totalDelivered,
            'totalRead' => $totalRead,
            'totalFailed' => $totalFailed,
            'deliveryRate' => $totalSent > 0 ? round(($totalDelivered / $totalSent) * 100, 1) : 0,
            'readRate' => $totalDelivered > 0 ? round(($totalRead / $totalDelivered) * 100, 1) : 0,
            'replyRate' => $totalSent > 0 ? round(($totalInbound / $totalSent) * 100, 1) : 0,
            'conversionRate' => 0,
            'revenueGenerated' => 0,
        ];
    }

    private function getDailyStats(?int $accountId): array
    {
        if (!$accountId) return [];

        return WhatsappMessage::where('whatsapp_account_id', $accountId)
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
    }

    private function getCampaignStats(?int $accountId): array
    {
        if (!$accountId) return [];

        return WhatsappCampaign::where('whatsapp_account_id', $accountId)
            ->select('id', 'name', 'total_sent as sent', 'total_delivered as delivered', 'total_read as read', 'total_failed as clicked', 'total_replies as replies')
            ->orderByDesc('total_sent')
            ->limit(10)
            ->get()
            ->map(fn ($c) => [...$c->toArray(), 'revenue' => 0])
            ->toArray();
    }

    private function getTopCampaigns(?int $accountId): array
    {
        if (!$accountId) return [];

        return WhatsappCampaign::where('whatsapp_account_id', $accountId)
            ->select('name', 'total_sent as sent', 'total_delivered as delivered', 'total_read as read')
            ->orderByDesc('total_sent')
            ->limit(5)
            ->get()
            ->map(fn ($c) => [...$c->toArray(), 'revenue' => 0])
            ->toArray();
    }

    private function getCustomerGrowth(?int $accountId): array
    {
        if (!$accountId) return [];

        return WhatsappContact::where('whatsapp_account_id', $accountId)
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as newContacts')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'newContacts' => $row->newContacts,
                'totalContacts' => 0,
            ])
            ->toArray();
    }

    private function getRevenueData(?int $accountId): array
    {
        if (!$accountId) return [];

        return collect(now()->subDays(30)->toPeriod(now())->toArray())
            ->map(fn ($date) => [
                'date' => $date->format('Y-m-d'),
                'revenue' => 0,
                'orders' => 0,
            ])
            ->toArray();
    }

    public function campaignStats(Request $request, int $campaignId): Response
    {
        return $this->index($request);
    }

    public function dateRange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date_range' => 'required|string|in:today,yesterday,7days,30days,month,year',
        ]);

        return response()->json(['processed' => true]);
    }
}
