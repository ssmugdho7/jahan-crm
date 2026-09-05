<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Expense;
use App\Models\FacebookAd;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getDashboardData($month, $year);

        return Inertia::render('reports/dashboard', [
            'summary' => $data['summary'],
            'charts' => $data['charts'],
            'currentMonth' => $month,
            'currentYear' => $year,
        ]);
    }

    public function liveData(Request $request): JsonResponse
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getDashboardData($month, $year);

        return response()->json([
            'summary' => $data['summary'],
            'charts' => $data['charts'],
            'currentMonth' => $month,
            'currentYear' => $year,
            'timestamp' => Carbon::now()->timestamp,
        ]);
    }

    private function getDashboardData(int $month, int $year): array
    {
        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();
        $monthStart = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $monthEnd = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();
        $yearStart = Carbon::createFromDate($year, 1, 1)->startOfDay();

        $todaySales = Order::whereDate('created_at', $today)->sum('total');
        $weeklySales = Order::where('created_at', '>=', $weekStart)->sum('total');
        $monthlySales = Order::whereBetween('created_at', [$monthStart, $monthEnd])->sum('total');
        $yearlySales = Order::where('created_at', '>=', $yearStart)->sum('total');

        $totalCustomers = Contact::count();
        $totalOrders = Order::count();
        $totalExpenses = Expense::sum('amount');
        $facebookAdCost = FacebookAd::sum('amount_spent');
        $netProfit = $yearlySales - $totalExpenses - $facebookAdCost;
        $pendingOrders = Order::where('order_status', 'Pending')->count();

        $monthlySalesData = Order::where('created_at', '>=', $yearStart)
            ->selectRaw('MONTH(created_at) as month, SUM(total) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $monthlyProfitData = Order::where('created_at', '>=', $yearStart)
            ->selectRaw('MONTH(created_at) as month, SUM(total) as revenue')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $expenseBreakdown = Expense::where('created_at', '>=', $yearStart)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        $orderStatusData = Order::where('created_at', '>=', $yearStart)
            ->selectRaw('order_status, COUNT(*) as count')
            ->groupBy('order_status')
            ->get();

        $facebookAdTrend = FacebookAd::where('created_at', '>=', $yearStart)
            ->selectRaw('DATE(ad_date) as date, SUM(amount_spent) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $customerGrowth = Contact::where('created_at', '>=', $yearStart)
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return [
            'summary' => [
                'today_sales' => $todaySales,
                'weekly_sales' => $weeklySales,
                'monthly_sales' => $monthlySales,
                'yearly_sales' => $yearlySales,
                'total_customers' => $totalCustomers,
                'total_orders' => $totalOrders,
                'total_expenses' => $totalExpenses,
                'facebook_ad_cost' => $facebookAdCost,
                'net_profit' => $netProfit,
                'pending_orders' => $pendingOrders,
            ],
            'charts' => [
                'monthly_sales' => $monthlySalesData,
                'monthly_profit' => $monthlyProfitData,
                'expense_breakdown' => $expenseBreakdown,
                'order_status' => $orderStatusData,
                'facebook_ad_trend' => $facebookAdTrend,
                'customer_growth' => $customerGrowth,
            ],
        ];
    }
}
