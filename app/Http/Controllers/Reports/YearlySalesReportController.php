<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class YearlySalesReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getYearlyData($year);

        return Inertia::render('reports/yearly-sales', [
            'monthly_data' => $data['monthly_data'],
            'summary' => $data['summary'],
            'filters' => $request->only(['year', 'month']),
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
        ]);
    }

    public function liveData(Request $request): JsonResponse
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getYearlyData($year);

        return response()->json([
            'monthly_data' => $data['monthly_data'],
            'summary' => $data['summary'],
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
            'timestamp' => Carbon::now()->timestamp,
        ]);
    }

    private function getYearlyData(int $year): array
    {
        $monthlyData = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthStart = Carbon::createFromDate($year, $month, 1)->startOfDay();
            $monthEnd = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();

            $revenue = Order::whereBetween('created_at', [$monthStart, $monthEnd])->sum('total');
            $expenses = Expense::whereBetween('expense_date', [$monthStart, $monthEnd])->sum('amount');
            $profit = $revenue - $expenses;

            $monthlyData[] = [
                'month' => $month,
                'month_name' => Carbon::createFromDate($year, $month, 1)->format('M'),
                'revenue' => $revenue,
                'expenses' => $expenses,
                'profit' => $profit,
            ];
        }

        $totalRevenue = collect($monthlyData)->sum('revenue');
        $totalExpenses = collect($monthlyData)->sum('expenses');
        $totalProfit = collect($monthlyData)->sum('profit');

        return [
            'monthly_data' => $monthlyData,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_expenses' => $totalExpenses,
                'total_profit' => $totalProfit,
            ],
        ];
    }
}
