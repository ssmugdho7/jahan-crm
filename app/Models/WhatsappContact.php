<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class WhatsappContact extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_contacts';

    protected $fillable = [
        'whatsapp_account_id',
        'contact_id',
        'name',
        'phone',
        'whatsapp_number',
        'email',
        'avatar',
        'status',
        'tags',
        'last_message_at',
        'last_message_preview',
        'total_orders',
        'total_purchase',
        'opt_in',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'opt_in' => 'boolean',
            'last_message_at' => 'datetime',
            'total_purchase' => 'decimal:2',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(WhatsappAccount::class, 'whatsapp_account_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WhatsappMessage::class, 'whatsapp_contact_id');
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(WhatsappConversation::class, 'whatsapp_contact_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('status', 'inactive');
    }

    public function scopeVip(Builder $query): Builder
    {
        return $query->where('status', 'vip');
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }
}
