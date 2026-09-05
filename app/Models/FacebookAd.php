<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FacebookAd extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_name',
        'objective',
        'budget',
        'amount_spent',
        'reach',
        'clicks',
        'cpc',
        'cpm',
        'ctr',
        'leads',
        'purchases',
        'roas',
        'ad_date',
    ];

    protected $casts = [
        'budget' => 'decimal:3',
        'amount_spent' => 'decimal:3',
        'cpc' => 'decimal:3',
        'cpm' => 'decimal:3',
        'ctr' => 'decimal:2',
        'roas' => 'decimal:2',
        'ad_date' => 'date',
    ];
}
