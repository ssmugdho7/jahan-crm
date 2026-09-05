<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DailySalesReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        if ($request->filled('month') || $request->filled('year')) {
            $startDate = Carbon::createFromDate($year, $month, 1)->startOfDay();
            $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();
        } else {
            $date = $request->get('date', Carbon::today()->format('Y-m-d'));
            $startDate = Carbon::parse($date)->startOfDay();
            $endDate = Carbon::parse($date)->endOfDay();
        }

        $data = $this->getDailyData($request, $startDate, $endDate);

        return Inertia::render('reports/daily-sales', [
            'orders' => $data['orders'],
            'summary' => $data['summary'],
            'filters' => $request->only(['date', 'search', 'payment_status', 'order_status', 'sort_field', 'sort_direction', 'month', 'year']),
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
            $date = $request->get('date', Carbon::today()->format('Y-m-d'));
            $startDate = Carbon::parse($date)->startOfDay();
            $endDate = Carbon::parse($date)->endOfDay();
        }

        $data = $this->getDailyData($request, $startDate, $endDate);

        return response()->json([
            'orders' => $data['orders'],
            'summary' => $data['summary'],
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
            'timestamp' => Carbon::now()->timestamp,
        ]);
    }

    private function getDailyData(Request $request, Carbon $startDate, Carbon $endDate): array
    {
        $query = Order::with(['contact', 'items.product'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_no', 'like', "%{$search}%")
                    ->orWhereHas('contact', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->get('payment_status'));
        }

        if ($request->filled('order_status')) {
            $query->where('order_status', $request->get('order_status'));
        }

        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $orders = $query->paginate($request->get('per_page', 15));

        $totalOrders = $orders->total();
        $totalSales = Order::whereBetween('created_at', [$startDate, $endDate])->sum('total');
        $totalProfit = Order::whereBetween('created_at', [$startDate, $endDate])->sum('total')
            - Order::whereBetween('created_at', [$startDate, $endDate])->sum('discount');

        return [
            'orders' => $orders,
            'summary' => [
                'total_orders' => $totalOrders,
                'total_sales' => $totalSales,
                'total_profit' => $totalProfit,
            ],
        ];
    }
}
