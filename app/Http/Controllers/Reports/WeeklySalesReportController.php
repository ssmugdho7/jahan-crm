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

class WeeklySalesReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        if ($request->filled('month') || $request->filled('year')) {
            $startDate = Carbon::createFromDate($year, $month, 1)->startOfDay();
            $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();
        } else {
            $weekStart = $request->get('start_date', Carbon::now()->startOfWeek()->format('Y-m-d'));
            $weekEnd = $request->get('end_date', Carbon::now()->endOfWeek()->format('Y-m-d'));
            $startDate = Carbon::parse($weekStart)->startOfDay();
            $endDate = Carbon::parse($weekEnd)->endOfDay();
        }

        $data = $this->getWeeklyData($startDate, $endDate);

        return Inertia::render('reports/weekly-sales', [
            'summary' => $data['summary'],
            'previous' => $data['previous'],
            'daily_sales' => $data['daily_sales'],
            'filters' => $request->only(['start_date', 'end_date', 'month', 'year']),
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
        ]);
    }

    public function liveData(Request $request): JsonResponse
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        if ($request->filled('month') || $request->filled('year')) {
            $startDate = Carbon::createFromDate($year, $month, 1)->startOfDay();
            $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();
        } else {
            $weekStart = $request->get('start_date', Carbon::now()->startOfWeek()->format('Y-m-d'));
            $weekEnd = $request->get('end_date', Carbon::now()->endOfWeek()->format('Y-m-d'));
            $startDate = Carbon::parse($weekStart)->startOfDay();
            $endDate = Carbon::parse($weekEnd)->endOfDay();
        }

        $data = $this->getWeeklyData($startDate, $endDate);

        return response()->json([
            'summary' => $data['summary'],
            'previous' => $data['previous'],
            'daily_sales' => $data['daily_sales'],
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
            'timestamp' => Carbon::now()->timestamp,
        ]);
    }

    private function getWeeklyData(Carbon $startDate, Carbon $endDate): array
    {
        $prevWeekStart = $startDate->copy()->subWeek();
        $prevWeekEnd = $endDate->copy()->subWeek();

        $orders = Order::whereBetween('created_at', [$startDate, $endDate])->get();
        $prevOrders = Order::whereBetween('created_at', [$prevWeekStart, $prevWeekEnd])->get();

        $expenses = Expense::whereBetween('expense_date', [$startDate, $endDate])->sum('amount');
        $prevExpenses = Expense::whereBetween('expense_date', [$prevWeekStart, $prevWeekEnd])->sum('amount');

        $facebookCost = FacebookAd::whereBetween('ad_date', [$startDate, $endDate])->sum('amount_spent');
        $prevFacebookCost = FacebookAd::whereBetween('ad_date', [$prevWeekStart, $prevWeekEnd])->sum('amount_spent');

        $revenue = $orders->sum('total');
        $prevRevenue = $prevOrders->sum('total');

        $profit = $revenue - $expenses - $facebookCost;
        $prevProfit = $prevRevenue - $prevExpenses - $prevFacebookCost;

        $dailySales = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'summary' => [
                'orders' => $orders->count(),
                'revenue' => $revenue,
                'expenses' => $expenses,
                'facebook_cost' => $facebookCost,
                'profit' => $profit,
            ],
            'previous' => [
                'orders' => $prevOrders->count(),
                'revenue' => $prevRevenue,
                'expenses' => $prevExpenses,
                'facebook_cost' => $prevFacebookCost,
                'profit' => $prevProfit,
            ],
            'daily_sales' => $dailySales,
        ];
    }
}
