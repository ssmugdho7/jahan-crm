<?php

namespace App\Http\Controllers;

use App\Models\CurrencySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('currency', [
            'currencies' => CurrencySetting::orderBy('from_currency')->get(),
            'defaultRate' => CurrencySetting::getRate('KWD', 'BDT'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'from_currency' => 'required|string|max:10',
            'to_currency'   => 'required|string|max:10',
            'rate'          => 'required|numeric|min:0',
        ]);

        CurrencySetting::updateOrCreate(
            ['from_currency' => $data['from_currency'], 'to_currency' => $data['to_currency']],
            ['rate' => $data['rate']]
        );

        return back();
    }
}
