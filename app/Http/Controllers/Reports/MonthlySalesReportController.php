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

class MonthlySalesReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();

        $data = $this->getMonthlyData($startDate, $endDate);

        return Inertia::render('reports/monthly-sales', [
            'summary' => $data['summary'],
            'charts' => $data['charts'],
            'filters' => $request->only(['month', 'year']),
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
        ]);
    }

    public function liveData(Request $request): JsonResponse
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();

        $data = $this->getMonthlyData($startDate, $endDate);

        return response()->json([
            'summary' => $data['summary'],
            'charts' => $data['charts'],
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
            'timestamp' => Carbon::now()->timestamp,
        ]);
    }

    private function getMonthlyData(Carbon $startDate, Carbon $endDate): array
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])->get();

        $sales = $orders->sum('total');
        $expenses = Expense::whereBetween('expense_date', [$startDate, $endDate])->sum('amount');
        $facebookAdsCost = FacebookAd::whereBetween('ad_date', [$startDate, $endDate])->sum('amount_spent');

        $totalCustomers = Contact::count();
        $newCustomers = Contact::whereBetween('created_at', [$startDate, $endDate])->count();
        $completedOrders = $orders->where('order_status', 'Done')->count();
        $cancelledOrders = $orders->where('order_status', 'Cancelled')->count();

        $weeklySales = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('WEEK(created_at) as week, SUM(total) as total')
            ->groupBy('week')
            ->orderBy('week')
            ->get();

        $weeklyProfit = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('WEEK(created_at) as week, SUM(total) as revenue')
            ->groupBy('week')
            ->orderBy('week')
            ->get();

        return [
            'summary' => [
                'sales' => $sales,
                'expenses' => $expenses,
                'facebook_ads_cost' => $facebookAdsCost,
                'total_customers' => $totalCustomers,
                'new_customers' => $newCustomers,
                'completed_orders' => $completedOrders,
                'cancelled_orders' => $cancelledOrders,
            ],
            'charts' => [
                'weekly_sales' => $weeklySales,
                'weekly_profit' => $weeklyProfit,
            ],
        ];
    }
}
