<?php

namespace App\Http\Controllers;

use App\Models\LocationDeliveryCharge;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationDeliveryChargeController extends Controller
{
    public function index(): Response
    {
        $locations = LocationDeliveryCharge::orderBy('location_name')->get();

        return Inertia::render('location-delivery-charges', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'location_name' => 'required|string|max:255',
            'delivery_charge_kwd' => 'required|numeric|min:0',
        ]);

        $data['is_active'] = true;

        LocationDeliveryCharge::create($data);

        return back();
    }

    public function storeBulk(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'locations' => 'required|array|min:1|max:50',
            'locations.*.location_name' => 'required|string|max:255',
            'locations.*.delivery_charge_kwd' => 'required|numeric|min:0',
        ]);

        foreach ($data['locations'] as $location) {
            LocationDeliveryCharge::updateOrCreate(
                ['location_name' => $location['location_name']],
                [
                    'delivery_charge_kwd' => $location['delivery_charge_kwd'],
                    'is_active' => true,
                ]
            );
        }

        return back();
    }

    public function update(Request $request, LocationDeliveryCharge $locationDeliveryCharge): RedirectResponse
    {
        $data = $request->validate([
            'location_name' => 'required|string|max:255',
            'delivery_charge_kwd' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $locationDeliveryCharge->update($data);

        return back();
    }

    public function destroy(LocationDeliveryCharge $locationDeliveryCharge): RedirectResponse
    {
        $locationDeliveryCharge->delete();

        return back();
    }
}
