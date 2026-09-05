<?php

use App\Http\Controllers\CrmController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\IncomeStatementController;
use App\Http\Controllers\LocationDeliveryChargeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Reports\CustomerReportController;
use App\Http\Controllers\Reports\DashboardReportController;
use App\Http\Controllers\Reports\DailySalesReportController;
use App\Http\Controllers\Reports\ExpenseReportController;
use App\Http\Controllers\Reports\FacebookAdsReportController;
use App\Http\Controllers\Reports\MonthlySalesReportController;
use App\Http\Controllers\Reports\ProfitReportController;
use App\Http\Controllers\Reports\WeeklySalesReportController;
use App\Http\Controllers\Reports\YearlySalesReportController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CrmController::class, 'index'])->name('home');
Route::get('/dashboard', [CrmController::class, 'index'])->name('dashboard');
Route::get('/contacts', [CrmController::class, 'contacts'])->name('contacts');
Route::get('/report', [CrmController::class, 'report'])->name('report');
Route::get('/report/csv', [CrmController::class, 'reportCsv'])->name('report.csv');
Route::get('/contacts/csv', [CrmController::class, 'contactsCsv'])->name('contacts.csv');
Route::post('/companies', [CrmController::class, 'storeCompany'])->name('companies.store');
Route::post('/contacts', [CrmController::class, 'storeContact'])->name('contacts.store');
Route::put('/contacts/{contact}', [CrmController::class, 'updateContact'])->name('contacts.update');
Route::delete('/contacts/{contact}', [CrmController::class, 'destroyContact'])->name('contacts.destroy');

Route::get('/currency', [CurrencyController::class, 'index'])->name('currency');
Route::post('/currency', [CurrencyController::class, 'update'])->name('currency.update');

Route::get('/income-statement', [IncomeStatementController::class, 'index'])->name('income-statement');
Route::post('/income-statement', [IncomeStatementController::class, 'store'])->name('income-statement.store');
Route::put('/income-statement/{incomeStatement}', [IncomeStatementController::class, 'update'])->name('income-statement.update');
Route::delete('/income-statement/{incomeStatement}', [IncomeStatementController::class, 'destroy'])->name('income-statement.destroy');

Route::get('/calculator', function () {
    return \Inertia\Inertia::render('calculator');
})->name('calculator');

Route::get('/smart-calendar', function () {
    $contacts = \App\Models\Contact::all();
    return \Inertia\Inertia::render('smart-calendar', [
        'contacts' => $contacts,
    ]);
})->name('smart-calendar');

Route::get('/whatsapp-marketing', function () {
    $contacts = \App\Models\Contact::all();
    $products = \App\Models\Product::all();

    $totalContacts = $contacts->count();
    $deliveredOrders = $contacts->where('order_status', 'Done')->count();
    $pendingOrders = $contacts->where('order_status', 'Pending')->count();
    $cancelledOrders = $contacts->where('order_status', 'Cancel')->count();
    $upcomingOrders = $contacts->where('order_status', 'Upcoming')->count();

    $totalRevenue = (float) $contacts->sum('total_order_amount');
    $totalProfit = (float) $contacts->sum('profit');

    $paidContacts = $contacts->where('paid_status', 'Paid')->count();
    $nonPaidContacts = $contacts->where('paid_status', 'Non-Paid')->count();

    $recentContacts = $contacts->sortByDesc('created_at')->take(20)->values();

    return \Inertia\Inertia::render('whatsapp-marketing', [
        'contacts' => $contacts->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'mobile' => $c->mobile,
                'email' => $c->email,
                'product_name' => $c->product_name,
                'order_status' => $c->order_status,
                'paid_status' => $c->paid_status,
                'total_order_amount' => $c->total_order_amount,
                'profit' => $c->profit,
                'order_date' => $c->order_date?->format('Y-m-d'),
                'created_at' => $c->created_at?->format('Y-m-d H:i'),
            ];
        }),
        'products' => $products->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->price,
            ];
        }),
        'stats' => [
            'totalContacts' => $totalContacts,
            'deliveredOrders' => $deliveredOrders,
            'pendingOrders' => $pendingOrders,
            'cancelledOrders' => $cancelledOrders,
            'upcomingOrders' => $upcomingOrders,
            'totalRevenue' => $totalRevenue,
            'totalProfit' => $totalProfit,
            'paidContacts' => $paidContacts,
            'nonPaidContacts' => $nonPaidContacts,
        ],
    ]);
})->name('whatsapp-marketing');

Route::get('/products', [ProductController::class, 'index'])->name('products');
Route::post('/products', [ProductController::class, 'store'])->name('products.store');
Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

Route::get('/location-delivery-charges', [LocationDeliveryChargeController::class, 'index'])->name('location-delivery-charges');
Route::post('/location-delivery-charges', [LocationDeliveryChargeController::class, 'store'])->name('location-delivery-charges.store');
Route::post('/location-delivery-charges/bulk', [LocationDeliveryChargeController::class, 'storeBulk'])->name('location-delivery-charges.bulk');
Route::put('/location-delivery-charges/{locationDeliveryCharge}', [LocationDeliveryChargeController::class, 'update'])->name('location-delivery-charges.update');
Route::delete('/location-delivery-charges/{locationDeliveryCharge}', [LocationDeliveryChargeController::class, 'destroy'])->name('location-delivery-charges.destroy');

// Monthly Reports
Route::prefix('reports')->name('reports.')->group(function () {
    Route::get('/dashboard', [DashboardReportController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/live', [DashboardReportController::class, 'liveData'])->name('dashboard.live');
    Route::get('/daily-sales', [DailySalesReportController::class, 'index'])->name('daily-sales');
    Route::get('/daily-sales/live', [DailySalesReportController::class, 'liveData'])->name('daily-sales.live');
    Route::get('/weekly-sales', [WeeklySalesReportController::class, 'index'])->name('weekly-sales');
    Route::get('/weekly-sales/live', [WeeklySalesReportController::class, 'liveData'])->name('weekly-sales.live');
    Route::get('/monthly-sales', [MonthlySalesReportController::class, 'index'])->name('monthly-sales');
    Route::get('/monthly-sales/live', [MonthlySalesReportController::class, 'liveData'])->name('monthly-sales.live');
    Route::get('/yearly-sales', [YearlySalesReportController::class, 'index'])->name('yearly-sales');
    Route::get('/yearly-sales/live', [YearlySalesReportController::class, 'liveData'])->name('yearly-sales.live');
    Route::get('/customers', [CustomerReportController::class, 'index'])->name('customers');
    Route::get('/customers/live', [CustomerReportController::class, 'liveData'])->name('customers.live');
    Route::get('/customers/{contact}', [CustomerReportController::class, 'show'])->name('customers.show');
    Route::get('/expenses', [ExpenseReportController::class, 'index'])->name('expenses');
    Route::get('/expenses/live', [ExpenseReportController::class, 'liveData'])->name('expenses.live');
    Route::get('/facebook-ads', [FacebookAdsReportController::class, 'index'])->name('facebook-ads');
    Route::get('/facebook-ads/live', [FacebookAdsReportController::class, 'liveData'])->name('facebook-ads.live');
    Route::get('/profit', [ProfitReportController::class, 'index'])->name('profit');
    Route::get('/profit/live', [ProfitReportController::class, 'liveData'])->name('profit.live');
});

require __DIR__.'/whatsapp.php';

require __DIR__.'/settings.php';
