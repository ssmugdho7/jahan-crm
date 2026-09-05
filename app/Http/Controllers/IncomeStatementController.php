<?php

namespace App\Http\Controllers;

use App\Models\IncomeStatement;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeStatementController extends Controller
{
    public function index(): Response
    {
        $statements = IncomeStatement::orderBy('created_at', 'desc')->get();
        $totalSales = $statements->sum('total_sales');
        $totalFacebookBoost = $statements->sum('facebook_boost_cost');
        $totalMobileInternet = $statements->sum('mobile_internet_cost');
        $totalNetProfit = $statements->sum('net_profit');

        $previousMonth = Carbon::now()->subMonth();
        $lastMonthStatements = IncomeStatement::whereYear('created_at', $previousMonth->year)
            ->whereMonth('created_at', $previousMonth->month)
            ->get();

        $lastMonthTotals = [
            'total_sales' => $lastMonthStatements->sum('total_sales'),
            'facebook_boost_cost' => $lastMonthStatements->sum('facebook_boost_cost'),
            'mobile_internet_cost' => $lastMonthStatements->sum('mobile_internet_cost'),
            'net_profit' => $lastMonthStatements->sum('net_profit'),
            'period' => $previousMonth->format('F Y'),
        ];

        return Inertia::render('income-statement', [
            'statements' => $statements,
            'totals' => [
                'total_sales' => $totalSales,
                'facebook_boost_cost' => $totalFacebookBoost,
                'mobile_internet_cost' => $totalMobileInternet,
                'net_profit' => $totalNetProfit,
            ],
            'lastMonthTotals' => $lastMonthTotals,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'period' => 'nullable|string|max:100',
            'total_sales' => 'required|numeric|min:0',
            'facebook_boost_cost' => 'required|numeric|min:0',
            'mobile_internet_cost' => 'required|numeric|min:0',
        ]);

        $data['net_profit'] = IncomeStatement::calculateNetProfit(
            $data['total_sales'],
            $data['facebook_boost_cost'],
            $data['mobile_internet_cost']
        );

        IncomeStatement::create($data);

        return back();
    }

    public function update(Request $request, IncomeStatement $incomeStatement): RedirectResponse
    {
        $data = $request->validate([
            'period' => 'nullable|string|max:100',
            'total_sales' => 'required|numeric|min:0',
            'facebook_boost_cost' => 'required|numeric|min:0',
            'mobile_internet_cost' => 'required|numeric|min:0',
        ]);

        $data['net_profit'] = IncomeStatement::calculateNetProfit(
            $data['total_sales'],
            $data['facebook_boost_cost'],
            $data['mobile_internet_cost']
        );

        $incomeStatement->update($data);

        return back();
    }

    public function destroy(IncomeStatement $incomeStatement): RedirectResponse
    {
        $incomeStatement->delete();

        return back();
    }
}
