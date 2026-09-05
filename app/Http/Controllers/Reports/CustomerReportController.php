<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerReportController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getCustomerData($request, $month, $year);

        return Inertia::render('reports/customers', [
            'customers' => $data['customers'],
            'filters' => $request->only(['search', 'sort_field', 'sort_direction', 'month', 'year']),
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
        ]);
    }

    public function liveData(Request $request): JsonResponse
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $data = $this->getCustomerData($request, $month, $year);

        return response()->json([
            'customers' => $data['customers'],
            'currentMonth' => Carbon::now()->month,
            'currentYear' => Carbon::now()->year,
            'timestamp' => Carbon::now()->timestamp,
        ]);
    }

    private function getCustomerData(Request $request, int $month, int $year): array
    {
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();

        $query = Contact::withSum(['orders as total_purchased'], 'total')
            ->withCount('orders');

        $query->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sort_field')) {
            $sortField = $request->get('sort_field');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $customers = $query->paginate($request->get('per_page', 15));

        return [
            'customers' => $customers,
        ];
    }

    public function show(Contact $contact)
    {
        $contact->load(['orders' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }]);

        $totalOrders = $contact->orders()->count();
        $totalPurchased = $contact->orders()->sum('total');
        $totalPaid = $contact->orders()->where('payment_status', 'Paid')->sum('total');
        $dueAmount = $totalPurchased - $totalPaid;
        $lastOrder = $contact->orders()->latest()->first();

        return response()->json([
            'customer' => $contact,
            'stats' => [
                'total_orders' => $totalOrders,
                'total_purchased' => $totalPurchased,
                'total_paid' => $totalPaid,
                'due_amount' => $dueAmount,
                'last_order_date' => $lastOrder?->created_at,
            ],
        ]);
    }
}
