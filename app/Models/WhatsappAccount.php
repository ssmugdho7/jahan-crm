<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class WhatsappAccount extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_accounts';

    protected $fillable = [
        'user_id',
        'business_name',
        'phone_number',
        'country_code',
        'whatsapp_business_account_id',
        'phone_number_id',
        'meta_app_id',
        'meta_app_secret',
        'permanent_access_token',
        'webhook_url',
        'webhook_verify_token',
        'business_website',
        'business_email',
        'business_logo',
        'connection_status',
        'last_sync_at',
    ];

    protected function casts(): array
    {
        return [
            'meta_app_secret' => 'encrypted',
            'permanent_access_token' => 'encrypted',
            'last_sync_at' => 'datetime',
        ];
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(WhatsappContact::class, 'whatsapp_account_id');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(WhatsappCampaign::class, 'whatsapp_account_id');
    }

    public function templates(): HasMany
    {
        return $this->hasMany(WhatsappTemplate::class, 'whatsapp_account_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WhatsappMessage::class, 'whatsapp_account_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(WhatsappConversation::class, 'whatsapp_account_id');
    }

    public function autoMessages(): HasMany
    {
        return $this->hasMany(WhatsappAutoMessage::class, 'whatsapp_account_id');
    }

    public function webhooks(): HasMany
    {
        return $this->hasMany(WhatsappWebhook::class, 'whatsapp_account_id');
    }

    public function isConnected(): bool
    {
        return $this->connection_status === 'connected' && $this->last_sync_at !== null;
    }

    public function getMessageCount(): int
    {
        return $this->messages()->count();
    }

    public function getContactCount(): int
    {
        return $this->contacts()->count();
    }
}
