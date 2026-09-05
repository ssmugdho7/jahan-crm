<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\FacebookAd;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FacebookAdsReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getFacebookAdsData($request, $month, $year);

        return Inertia::render('reports/facebook-ads', [
            'ads' => $data['ads'],
            'summary' => $data['summary'],
            'charts' => $data['charts'],
            'filters' => $request->only(['start_date', 'end_date', 'search', 'month', 'year']),
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
        ]);
    }

    public function liveData(Request $request): JsonResponse
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getFacebookAdsData($request, $month, $year);

        return response()->json([
            'ads' => $data['ads'],
            'summary' => $data['summary'],
            'charts' => $data['charts'],
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
            'timestamp' => Carbon::now()->timestamp,
        ]);
    }

    private function getFacebookAdsData(Request $request, int $month, int $year): array
    {
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();

        $query = FacebookAd::query();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $sDate = Carbon::parse($request->get('start_date'))->startOfDay();
            $eDate = Carbon::parse($request->get('end_date'))->endOfDay();
            $query->whereBetween('ad_date', [$sDate, $eDate]);
        } else {
            $query->whereBetween('ad_date', [$startDate, $endDate]);
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('campaign_name', 'like', "%{$search}%");
        }

        $query->orderBy('ad_date', 'desc');

        $ads = $query->paginate($request->get('per_page', 15));

        $totalBudget = FacebookAd::whereBetween('ad_date', [$startDate, $endDate])->sum('budget');
        $totalSpend = FacebookAd::whereBetween('ad_date', [$startDate, $endDate])->sum('amount_spent');
        $avgRoas = FacebookAd::whereBetween('ad_date', [$startDate, $endDate])->avg('roas');
        $avgCpc = FacebookAd::whereBetween('ad_date', [$startDate, $endDate])->avg('cpc');

        $dailySpend = FacebookAd::whereBetween('ad_date', [$startDate, $endDate])
            ->selectRaw('ad_date as date, SUM(amount_spent) as total')
            ->groupBy('ad_date')
            ->orderBy('ad_date')
            ->get();

        $roasTrend = FacebookAd::whereBetween('ad_date', [$startDate, $endDate])
            ->selectRaw('ad_date as date, AVG(roas) as avg_roas')
            ->groupBy('ad_date')
            ->orderBy('ad_date')
            ->get();

        $cpcTrend = FacebookAd::whereBetween('ad_date', [$startDate, $endDate])
            ->selectRaw('ad_date as date, AVG(cpc) as avg_cpc')
            ->groupBy('ad_date')
            ->orderBy('ad_date')
            ->get();

        return [
            'ads' => $ads,
            'summary' => [
                'total_budget' => $totalBudget,
                'total_spend' => $totalSpend,
                'avg_roas' => $avgRoas,
                'avg_cpc' => $avgCpc,
            ],
            'charts' => [
                'daily_spend' => $dailySpend,
                'roas_trend' => $roasTrend,
                'cpc_trend' => $cpcTrend,
            ],
        ];
    }
}
