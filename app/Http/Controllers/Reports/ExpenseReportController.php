<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getExpenseData($request, $month, $year);

        return Inertia::render('reports/expenses', [
            'expenses' => $data['expenses'],
            'summary' => $data['summary'],
            'category_summary' => $data['category_summary'],
            'filters' => $request->only(['category', 'start_date', 'end_date', 'search', 'month', 'year']),
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
        ]);
    }

    public function liveData(Request $request): JsonResponse
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getExpenseData($request, $month, $year);

        return response()->json([
            'expenses' => $data['expenses'],
            'summary' => $data['summary'],
            'category_summary' => $data['category_summary'],
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
            'timestamp' => Carbon::now()->timestamp,
        ]);
    }

    private function getExpenseData(Request $request, int $month, int $year): array
    {
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();

        $query = Expense::with('user');

        if ($request->filled('category')) {
            $query->where('category', $request->get('category'));
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $sDate = Carbon::parse($request->get('start_date'))->startOfDay();
            $eDate = Carbon::parse($request->get('end_date'))->endOfDay();
            $query->whereBetween('expense_date', [$sDate, $eDate]);
        } else {
            $query->whereBetween('expense_date', [$startDate, $endDate]);
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $query->orderBy('expense_date', 'desc');

        $expenses = $query->paginate($request->get('per_page', 15));

        $todayExpenses = Expense::whereDate('expense_date', Carbon::today())->sum('amount');
        $monthlyExpenses = Expense::whereBetween('expense_date', [$startDate, $endDate])->sum('amount');

        $categorySummary = Expense::whereBetween('expense_date', [$startDate, $endDate])
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        return [
            'expenses' => $expenses,
            'summary' => [
                'today_expenses' => $todayExpenses,
                'monthly_expenses' => $monthlyExpenses,
            ],
            'category_summary' => $categorySummary,
        ];
    }
}
