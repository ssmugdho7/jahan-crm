<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationDeliveryCharge extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_name',
        'delivery_charge_kwd',
        'is_active',
    ];

    protected $casts = [
        'delivery_charge_kwd' => 'decimal:3',
        'is_active' => 'boolean',
    ];
}
