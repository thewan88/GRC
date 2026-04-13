<?php

use App\Http\Controllers\Api\V1\AssetController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ControlController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\RiskController;
use App\Http\Controllers\Api\V1\TrustCentreController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

// ─── v1 API ───────────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // ── Auth (Entra ID OAuth2) ────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::get('redirect', [AuthController::class, 'redirect'])->name('auth.redirect');
        Route::get('callback', [AuthController::class, 'callback'])->name('auth.callback');
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    // ── Trust Centre (mixed: some public, some Sanctum-protected) ────────────
    Route::prefix('trust-centre')->group(function () {
        // Public — no auth
        Route::get('profile', [TrustCentreController::class, 'profile']);
        Route::get('metrics', [TrustCentreController::class, 'metrics']);
        Route::get('documents', [TrustCentreController::class, 'documents']);
        Route::get('documents/{document}/download', [TrustCentreController::class, 'downloadDocument']);
        Route::post('access-requests', [TrustCentreController::class, 'submitAccessRequest']);
        Route::post('verify', [TrustCentreController::class, 'verify']);

        // Admin management (Sanctum auth required)
        Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
            Route::get('access-requests', [TrustCentreController::class, 'adminAccessRequests']);
            Route::patch('access-requests/{accessRequest}/approve', [TrustCentreController::class, 'approveAccessRequest']);
            Route::patch('access-requests/{accessRequest}/reject', [TrustCentreController::class, 'rejectAccessRequest']);
            Route::post('documents', [TrustCentreController::class, 'uploadDocument']);
            Route::get('download-log', [TrustCentreController::class, 'downloadLog']);
        });
    });

    // ── Authenticated API (Sanctum session required) ──────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Users (admin management)
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('{user}', [UserController::class, 'show']);
            Route::patch('{user}/role', [UserController::class, 'updateRole']);
            Route::patch('{user}/deactivate', [UserController::class, 'deactivate']);
            Route::patch('{user}/activate', [UserController::class, 'activate']);
        });

        // Risks
        Route::prefix('risks')->group(function () {
            Route::get('export/csv', [RiskController::class, 'exportCsv']);
            Route::get('/', [RiskController::class, 'index']);
            Route::post('/', [RiskController::class, 'store']);
            Route::get('{risk}', [RiskController::class, 'show']);
            Route::put('{risk}', [RiskController::class, 'update']);
            Route::get('{risk}/audit', [RiskController::class, 'auditLog']);
        });

        // Assets (Information Asset Register)
        Route::prefix('assets')->group(function () {
            Route::get('export/csv', [AssetController::class, 'exportCsv']);
            Route::get('/', [AssetController::class, 'index']);
            Route::post('/', [AssetController::class, 'store']);
            Route::get('{asset}', [AssetController::class, 'show']);
            Route::put('{asset}', [AssetController::class, 'update']);
            Route::get('{asset}/audit', [AssetController::class, 'auditLog']);
            Route::post('{asset}/third-parties', [AssetController::class, 'addThirdParty']);
            Route::delete('{asset}/third-parties/{thirdParty}', [AssetController::class, 'removeThirdParty']);
        });

        // Controls (ISO 27001 Annex A)
        Route::prefix('controls')->group(function () {
            Route::get('soa', [ControlController::class, 'statementOfApplicability']);
            Route::get('export/csv', [ControlController::class, 'statementOfApplicability']); // alias
            Route::get('/', [ControlController::class, 'index']);
            Route::get('{control}', [ControlController::class, 'show']);
            Route::put('{control}', [ControlController::class, 'update']);
        });

        // Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('summary', [DashboardController::class, 'summary']);
            Route::get('heat-map', [DashboardController::class, 'heatMap']);
            Route::get('risk-trend', [DashboardController::class, 'riskTrend']);
            Route::get('top-risks', [DashboardController::class, 'topRisks']);
            Route::get('upcoming', [DashboardController::class, 'upcoming']);
            Route::get('treatment-status', [DashboardController::class, 'treatmentStatus']);
        });

        // Audit Log
        Route::prefix('audit-log')->group(function () {
            Route::get('export/csv', [AuditLogController::class, 'exportCsv']);
            Route::get('/', [AuditLogController::class, 'index']);
        });
    });
});
