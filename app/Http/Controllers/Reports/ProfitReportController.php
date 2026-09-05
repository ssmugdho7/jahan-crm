<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\FacebookAd;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfitReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getProfitData($month, $year);

        return Inertia::render('reports/profit', [
            'summary' => $data['summary'],
            'charts' => $data['charts'],
            'filters' => $request->only(['period', 'year', 'month']),
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
        ]);
    }

    public function liveData(Request $request): JsonResponse
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getProfitData($month, $year);

        return response()->json([
            'summary' => $data['summary'],
            'charts' => $data['charts'],
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
            'timestamp' => Carbon::now()->timestamp,
        ]);
    }

    private function getProfitData(int $month, int $year): array
    {
        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();
        $monthStart = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $monthEnd = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();
        $yearStart = Carbon::createFromDate($year, 1, 1)->startOfDay();

        $revenue = [
            'today' => Order::whereDate('created_at', $today)->sum('total'),
            'weekly' => Order::where('created_at', '>=', $weekStart)->sum('total'),
            'monthly' => Order::whereBetween('created_at', [$monthStart, $monthEnd])->sum('total'),
            'yearly' => Order::where('created_at', '>=', $yearStart)->sum('total'),
        ];

        $facebookCost = [
            'today' => FacebookAd::whereDate('ad_date', $today)->sum('amount_spent'),
            'weekly' => FacebookAd::where('ad_date', '>=', $weekStart)->sum('amount_spent'),
            'monthly' => FacebookAd::whereBetween('ad_date', [$monthStart, $monthEnd])->sum('amount_spent'),
            'yearly' => FacebookAd::where('ad_date', '>=', $yearStart)->sum('amount_spent'),
        ];

        $mobileInternet = [
            'today' => Expense::where('category', 'Mobile Internet')->whereDate('expense_date', $today)->sum('amount'),
            'weekly' => Expense::where('category', 'Mobile Internet')->where('expense_date', '>=', $weekStart)->sum('amount'),
            'monthly' => Expense::where('category', 'Mobile Internet')->whereBetween('expense_date', [$monthStart, $monthEnd])->sum('amount'),
            'yearly' => Expense::where('category', 'Mobile Internet')->where('expense_date', '>=', $yearStart)->sum('amount'),
        ];

        $otherExpenses = [
            'today' => Expense::where('category', '!=', 'Mobile Internet')->whereDate('expense_date', $today)->sum('amount'),
            'weekly' => Expense::where('category', '!=', 'Mobile Internet')->where('expense_date', '>=', $weekStart)->sum('amount'),
            'monthly' => Expense::where('category', '!=', 'Mobile Internet')->whereBetween('expense_date', [$monthStart, $monthEnd])->sum('amount'),
            'yearly' => Expense::where('category', '!=', 'Mobile Internet')->where('expense_date', '>=', $yearStart)->sum('amount'),
        ];

        $netProfit = [
            'today' => $revenue['today'] - $facebookCost['today'] - $mobileInternet['today'] - $otherExpenses['today'],
            'weekly' => $revenue['weekly'] - $facebookCost['weekly'] - $mobileInternet['weekly'] - $otherExpenses['weekly'],
            'monthly' => $revenue['monthly'] - $facebookCost['monthly'] - $mobileInternet['monthly'] - $otherExpenses['monthly'],
            'yearly' => $revenue['yearly'] - $facebookCost['yearly'] - $mobileInternet['yearly'] - $otherExpenses['yearly'],
        ];

        $profitTrend = Order::whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) as month, SUM(total) as revenue')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $revenueVsExpense = [];
        for ($m = 1; $m <= 12; $m++) {
            $mStart = Carbon::createFromDate($year, $m, 1)->startOfDay();
            $mEnd = Carbon::createFromDate($year, $m, 1)->endOfMonth()->endOfDay();

            $rev = Order::whereBetween('created_at', [$mStart, $mEnd])->sum('total');
            $exp = Expense::whereBetween('expense_date', [$mStart, $mEnd])->sum('amount');

            $revenueVsExpense[] = [
                'month' => $m,
                'month_name' => Carbon::createFromDate($year, $m, 1)->format('M'),
                'revenue' => $rev,
                'expenses' => $exp,
            ];
        }

        return [
            'summary' => [
                'revenue' => $revenue,
                'facebook_cost' => $facebookCost,
                'mobile_internet' => $mobileInternet,
                'other_expenses' => $otherExpenses,
                'net_profit' => $netProfit,
            ],
            'charts' => [
                'profit_trend' => $profitTrend,
                'revenue_vs_expense' => $revenueVsExpense,
            ],
        ];
    }
}
