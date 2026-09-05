<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use HasFactory;
    protected $fillable = ['company_id', 'name', 'email', 'mobile', 'order_number', 'job_title', 'product_name', 'profit', 'total_order_amount', 'order_date', 'order_status', 'paid_status'];

    protected function casts(): array
    {
        return ['order_date' => 'date', 'order_status' => 'string'];
    }

    /** @return BelongsTo<Company, $this> */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
