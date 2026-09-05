<?php

use App\Http\Controllers\WhatsApp\WhatsappAnalyticsController;
use App\Http\Controllers\WhatsApp\WhatsappAudienceController;
use App\Http\Controllers\WhatsApp\WhatsappCampaignController;
use App\Http\Controllers\WhatsApp\WhatsappChatController;
use App\Http\Controllers\WhatsApp\WhatsappContactController;
use App\Http\Controllers\WhatsApp\WhatsappDashboardController;
use App\Http\Controllers\WhatsApp\WhatsappMessageController;
use App\Http\Controllers\WhatsApp\WhatsappSettingsController;
use App\Http\Controllers\WhatsApp\WhatsappTemplateController;
use App\Http\Controllers\WhatsApp\WhatsappWebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('whatsapp')->name('whatsapp.')->group(function () {
    Route::get('/settings', [WhatsappSettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [WhatsappSettingsController::class, 'store'])->name('settings.store');
    Route::post('/settings/test', [WhatsappSettingsController::class, 'testConnection'])->name('settings.test');
    Route::post('/settings/disconnect', [WhatsappSettingsController::class, 'disconnect'])->name('settings.disconnect');
    Route::post('/settings/webhook', [WhatsappSettingsController::class, 'generateWebhook'])->name('settings.webhook');

    Route::get('/dashboard', [WhatsappDashboardController::class, 'index'])->name('dashboard');

    Route::get('/contacts', [WhatsappContactController::class, 'index'])->name('contacts');
    Route::post('/contacts/import', [WhatsappContactController::class, 'import'])->name('contacts.import');
    Route::post('/contacts/sync', [WhatsappContactController::class, 'sync'])->name('contacts.sync');
    Route::put('/contacts/{id}', [WhatsappContactController::class, 'update'])->name('contacts.update');
    Route::delete('/contacts/{id}', [WhatsappContactController::class, 'destroy'])->name('contacts.destroy');
    Route::get('/contacts/export', [WhatsappContactController::class, 'export'])->name('contacts.export');

    Route::get('/audience', [WhatsappAudienceController::class, 'index'])->name('audience');
    Route::post('/audience', [WhatsappAudienceController::class, 'store'])->name('audience.store');
    Route::get('/audience/{id}', [WhatsappAudienceController::class, 'show'])->name('audience.show');
    Route::delete('/audience/{id}', [WhatsappAudienceController::class, 'destroy'])->name('audience.destroy');

    Route::get('/campaigns', [WhatsappCampaignController::class, 'index'])->name('campaigns');
    Route::get('/campaigns/create', [WhatsappCampaignController::class, 'create'])->name('campaigns.create');
    Route::post('/campaigns', [WhatsappCampaignController::class, 'store'])->name('campaigns.store');
    Route::get('/campaigns/{id}', [WhatsappCampaignController::class, 'show'])->name('campaigns.show');
    Route::get('/campaigns/{id}/edit', [WhatsappCampaignController::class, 'edit'])->name('campaigns.edit');
    Route::put('/campaigns/{id}', [WhatsappCampaignController::class, 'update'])->name('campaigns.update');
    Route::delete('/campaigns/{id}', [WhatsappCampaignController::class, 'destroy'])->name('campaigns.destroy');
    Route::post('/campaigns/{id}/send', [WhatsappCampaignController::class, 'send'])->name('campaigns.send');
    Route::post('/campaigns/{id}/schedule', [WhatsappCampaignController::class, 'schedule'])->name('campaigns.schedule');
    Route::post('/campaigns/{id}/cancel', [WhatsappCampaignController::class, 'cancel'])->name('campaigns.cancel');
    Route::post('/campaigns/{id}/duplicate', [WhatsappCampaignController::class, 'duplicate'])->name('campaigns.duplicate');

    Route::get('/templates', [WhatsappTemplateController::class, 'index'])->name('templates');
    Route::get('/templates/create', [WhatsappTemplateController::class, 'create'])->name('templates.create');
    Route::post('/templates', [WhatsappTemplateController::class, 'store'])->name('templates.store');
    Route::get('/templates/{id}', [WhatsappTemplateController::class, 'show'])->name('templates.show');
    Route::get('/templates/{id}/edit', [WhatsappTemplateController::class, 'edit'])->name('templates.edit');
    Route::put('/templates/{id}', [WhatsappTemplateController::class, 'update'])->name('templates.update');
    Route::delete('/templates/{id}', [WhatsappTemplateController::class, 'destroy'])->name('templates.destroy');
    Route::post('/templates/preview', [WhatsappTemplateController::class, 'preview'])->name('templates.preview');

    Route::get('/chat', [WhatsappChatController::class, 'index'])->name('chat');
    Route::get('/chat/{contactId}', [WhatsappChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/send', [WhatsappChatController::class, 'send'])->name('chat.send');
    Route::post('/chat/{contactId}/read', [WhatsappChatController::class, 'markRead'])->name('chat.read');
    Route::post('/chat/{contactId}/archive', [WhatsappChatController::class, 'archive'])->name('chat.archive');
    Route::get('/chat/search', [WhatsappChatController::class, 'search'])->name('chat.search');

    Route::get('/messages', [WhatsappMessageController::class, 'index'])->name('messages');
    Route::get('/messages/{id}', [WhatsappMessageController::class, 'show'])->name('messages.show');
    Route::get('/messages/export', [WhatsappMessageController::class, 'export'])->name('messages.export');

    Route::get('/analytics', [WhatsappAnalyticsController::class, 'index'])->name('analytics');
    Route::get('/analytics/campaign/{campaignId}', [WhatsappAnalyticsController::class, 'campaignStats'])->name('analytics.campaign');
    Route::post('/analytics/date-range', [WhatsappAnalyticsController::class, 'dateRange'])->name('analytics.date-range');

    Route::get('/webhook', [WhatsappWebhookController::class, 'verify'])->name('webhook.verify');
    Route::post('/webhook', [WhatsappWebhookController::class, 'handle'])->name('webhook.handle');
});
