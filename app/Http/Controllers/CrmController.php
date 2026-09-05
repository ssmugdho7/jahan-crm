<?php

namespace App\Http\Controllers;

use App\Models\CurrencySetting;
use App\Models\Company;
use App\Models\Contact;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CrmController extends Controller
{
    public function index(Request $request): Response
    {
        $filter = $request->get('filter', '30days');
        
        $query = Contact::with('company:id,name');
        
        // Apply date filter
        switch ($filter) {
            case 'today':
                $query->where(function ($q) {
                    $q->whereDate('order_date', today())
                      ->orWhereDate('created_at', today());
                });
                break;
            case 'yesterday':
                $query->where(function ($q) {
                    $q->whereDate('order_date', today()->subDay())
                      ->orWhereDate('created_at', today()->subDay());
                });
                break;
            case '7days':
                $query->where(function ($q) {
                    $q->where('order_date', '>=', now()->subDays(7))
                      ->orWhere('created_at', '>=', now()->subDays(7));
                });
                break;
            case '30days':
                $query->where(function ($q) {
                    $q->where('order_date', '>=', now()->subDays(30))
                      ->orWhere('created_at', '>=', now()->subDays(30));
                });
                break;
            case 'month':
                $query->where(function ($q) {
                    $q->whereMonth('order_date', now()->month)->whereYear('order_date', now()->year)
                      ->orWhere(function ($q2) {
                          $q2->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
                      });
                });
                break;
            case 'lastMonth':
                $query->where(function ($q) {
                    $q->whereMonth('order_date', now()->subMonth()->month)->whereYear('order_date', now()->subMonth()->year)
                      ->orWhere(function ($q2) {
                          $q2->whereMonth('created_at', now()->subMonth()->month)->whereYear('created_at', now()->subMonth()->year);
                      });
                });
                break;
            case 'year':
                $query->where(function ($q) {
                    $q->whereYear('order_date', now()->year)
                      ->orWhereYear('created_at', now()->year);
                });
                break;
        }
        
        $contactsByStatus = (clone $query)->select('order_status', DB::raw('count(*) as count'))
            ->groupBy('order_status')
            ->pluck('count', 'order_status')
            ->toArray();

        // Monthly contacts always shows last 6 months for chart trend
        $monthlyContacts = Contact::where('created_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('count(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $profitByMonth = (clone $query)->whereNotNull('profit')
            ->select(
                DB::raw("DATE_FORMAT(order_date, '%Y-%m') as month"),
                DB::raw('sum(profit) as total')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $expensesByMonth = \App\Models\IncomeStatement::where('created_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('sum(mobile_internet_cost + facebook_boost_cost) as total')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $contacts = $query->latest()->get();
        $totalProfit = (float) $contacts->sum('profit');

        $incomeQuery = \App\Models\IncomeStatement::query();
        
        // Apply date filter to income statements
        switch ($filter) {
            case 'today':
                $incomeQuery->whereDate('created_at', today());
                break;
            case 'yesterday':
                $incomeQuery->whereDate('created_at', today()->subDay());
                break;
            case '7days':
                $incomeQuery->where('created_at', '>=', now()->subDays(7));
                break;
            case '30days':
                $incomeQuery->where('created_at', '>=', now()->subDays(30));
                break;
            case 'month':
                $incomeQuery->whereMonth('created_at', now()->month)
                            ->whereYear('created_at', now()->year);
                break;
            case 'lastMonth':
                $incomeQuery->whereMonth('created_at', now()->subMonth()->month)
                            ->whereYear('created_at', now()->subMonth()->year);
                break;
            case 'year':
                $incomeQuery->whereYear('created_at', now()->year);
                break;
        }
        
        $incomeStatements = $incomeQuery->get();
        $totalIncome = (float) $incomeStatements->sum('total_sales');
        $netProfit = (float) $incomeStatements->sum('net_profit');

        return Inertia::render('dashboard', [
            'contacts' => $contacts,
            'stats' => [
                'contacts' => $contacts->count(),
                'totalProfit' => $totalProfit,
                'totalIncome' => $totalIncome,
                'netProfit' => $netProfit,
            ],
            'charts' => [
                'contactsByStatus' => $contactsByStatus,
                'monthlyContacts' => $monthlyContacts,
                'profitByMonth' => $profitByMonth,
                'expensesByMonth' => $expensesByMonth,
            ],
            'filter' => $filter,
        ]);
    }

    public function contacts(Request $request): Response
    {
        $query = Contact::with('company:id,name');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('mobile', 'like', "%{$search}%")
                  ->orWhere('product_name', 'like', "%{$search}%")
                  ->orWhere('order_number', 'like', "%{$search}%");
            });
        }

        return Inertia::render('contacts', [
            'contacts' => $query->latest()->get(),
            'search' => $search ?? '',
        ]);
    }

    public function report(Request $request): Response
    {
        if (!$request->filled('date_from') && !$request->filled('date_to')) {
            $previousMonth = Carbon::now()->subMonth();
            $request->merge([
                'date_from' => $previousMonth->startOfMonth()->format('Y-m-d'),
                'date_to' => $previousMonth->endOfMonth()->format('Y-m-d'),
            ]);
        }

        return Inertia::render('report', [
            'contacts' => $this->buildReportQuery($request)->latest()->get(),
            'filters' => $request->only(['name', 'mobile', 'email', 'product_name', 'profit_min', 'profit_max', 'order_status', 'date_from', 'date_to']),
            'exchangeRate' => CurrencySetting::getRate('KWD', 'BDT'),
        ]);
    }

    private function buildReportQuery(Request $request)
    {
        $query = Contact::with('company:id,name');

        if ($name = $request->get('name')) {
            $query->where('name', 'like', "%{$name}%");
        }
        if ($mobile = $request->get('mobile')) {
            $query->where('mobile', 'like', "%{$mobile}%");
        }
        if ($email = $request->get('email')) {
            $query->where('email', 'like', "%{$email}%");
        }
        if ($productName = $request->get('product_name')) {
            $query->where('product_name', 'like', "%{$productName}%");
        }
        if ($profitMin = $request->get('profit_min')) {
            $query->where('profit', '>=', (float) $profitMin);
        }
        if ($profitMax = $request->get('profit_max')) {
            $query->where('profit', '<=', (float) $profitMax);
        }
        if ($status = $request->get('order_status')) {
            $query->where('order_status', $status);
        }
        if ($from = $request->get('date_from')) {
            $query->whereDate('order_date', '>=', $from);
        }
        if ($to = $request->get('date_to')) {
            $query->whereDate('order_date', '<=', $to);
        }

        return $query;
    }

    public function reportCsv(Request $request): StreamedResponse
    {
        $contacts = $this->buildReportQuery($request)->latest()->get();

        return response()->streamDownload(function () use ($contacts) {
            $stream = fopen('php://output', 'w');
            fwrite($stream, "\xEF\xBB\xBF");

            fputcsv($stream, ['#', 'Name', 'Mobile', 'Product', 'Profit (KWD)', 'Order Date', 'Status']);

            foreach ($contacts as $i => $contact) {
                fputcsv($stream, [
                    $i + 1,
                    $contact->name ?? $contact->mobile ?? '',
                    $contact->mobile ?? '',
                    $contact->product_name ?? '',
                    number_format((float) ($contact->profit ?? 0), 2, '.', ''),
                    $contact->order_date?->format('Y-m-d') ?? '',
                    $contact->order_status,
                ]);
            }

            fclose($stream);
        }, 'report.csv');
    }

    public function contactsCsv(): StreamedResponse
    {
        $contacts = Contact::latest()->get();

        return response()->streamDownload(function () use ($contacts) {
            $stream = fopen('php://output', 'w');
            fwrite($stream, "\xEF\xBB\xBF");

            fputcsv($stream, ['#', 'Mobile', 'Product', 'Profit (KWD)', 'Order Date', 'Status']);

            foreach ($contacts as $i => $contact) {
                fputcsv($stream, [
                    $i + 1,
                    $contact->mobile ?? '',
                    $contact->product_name ?? '',
                    number_format((float) ($contact->profit ?? 0), 2, '.', ''),
                    $contact->order_date?->format('Y-m-d') ?? '',
                    $contact->order_status,
                ]);
            }

            fclose($stream);
        }, 'contacts.csv');
    }

    public function storeCompany(Request $request): RedirectResponse
    {
        Company::create($request->validate(['name' => 'required|string|max:120', 'industry' => 'nullable|string|max:80', 'website' => 'nullable|url|max:150', 'phone' => 'nullable|string|max:30']));

        return back();
    }

    public function storeContact(Request $request): RedirectResponse
    {
        Contact::create($request->validate(['company_id' => 'nullable|exists:companies,id', 'email' => 'nullable|email|max:150', 'mobile' => 'nullable|string|max:30', 'order_number' => 'nullable|string|max:50', 'job_title' => 'nullable|string|max:100', 'product_name' => 'nullable|string|max:150', 'profit' => 'nullable|numeric|min:0', 'total_order_amount' => 'nullable|numeric|min:0', 'order_date' => 'nullable|date', 'order_status' => 'required|in:Done,Cancel,Pending,Upcoming', 'paid_status' => 'required|in:Paid,Non-Paid']));

        return back();
    }

    public function updateContact(Request $request, Contact $contact): RedirectResponse
    {
        $contact->update($request->validate(['mobile' => 'nullable|string|max:30', 'order_number' => 'nullable|string|max:50', 'product_name' => 'nullable|string|max:150', 'profit' => 'nullable|numeric|min:0', 'total_order_amount' => 'nullable|numeric|min:0', 'order_date' => 'nullable|date', 'order_status' => 'required|in:Done,Cancel,Pending,Upcoming', 'paid_status' => 'required|in:Paid,Non-Paid']));

        return back();
    }

    public function destroyContact(Contact $contact): RedirectResponse
    {
        $contact->delete();

        return back();
    }
}
