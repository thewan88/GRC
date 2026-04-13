<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Control;
use App\Models\Risk;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /** GET /api/v1/dashboard/summary — KPI counts */
    public function summary(): JsonResponse
    {
        $openRisks = Risk::where('status', '!=', 'Closed')->get();

        $risksByLevel = $openRisks->groupBy(fn($r) => $r->risk_level)
            ->map->count()
            ->all();

        // Control compliance by theme
        $themes = ['Organisational', 'People', 'Physical', 'Technological'];
        $controlCompliance = [];
        foreach ($themes as $theme) {
            $themeControls  = Control::byTheme($theme)->get();
            $total          = $themeControls->count();
            $applicable     = $themeControls->where('status', '!=', 'Not Applicable')->count();
            $implemented    = $themeControls->implemented()->count();
            $controlCompliance[$theme] = [
                'total'       => $total,
                'applicable'  => $applicable,
                'implemented' => $implemented,
                'percentage'  => $applicable > 0 ? round(($implemented / $applicable) * 100) : 0,
            ];
        }

        // GDPR asset stats
        $assetsByClassification = Asset::active()
            ->select('classification', DB::raw('count(*) as count'))
            ->groupBy('classification')
            ->pluck('count', 'classification');

        $gdprStats = [
            'total_assets'         => Asset::active()->count(),
            'personal_data_assets' => Asset::active()->personalData()->count(),
            'by_classification'    => $assetsByClassification,
        ];

        // Treatment plan status
        $treatmentStats = $this->getTreatmentPlanStats();

        return response()->json([
            'data' => [
                'risks_by_level'       => $risksByLevel,
                'total_open_risks'     => $openRisks->count(),
                'control_compliance'   => $controlCompliance,
                'gdpr'                 => $gdprStats,
                'treatment_plan'       => $treatmentStats,
            ],
            'errors' => null,
        ]);
    }

    /** GET /api/v1/dashboard/heat-map — 5x5 matrix */
    public function heatMap(): JsonResponse
    {
        $risks = Risk::where('status', '!=', 'Closed')
            ->select('likelihood', 'impact', DB::raw('count(*) as count'))
            ->groupBy('likelihood', 'impact')
            ->get();

        // Build 5x5 matrix
        $matrix = [];
        for ($l = 1; $l <= 5; $l++) {
            for ($i = 1; $i <= 5; $i++) {
                $matrix[] = [
                    'likelihood' => $l,
                    'impact'     => $i,
                    'score'      => $l * $i,
                    'level'      => Risk::scoreToLevel($l * $i),
                    'count'      => 0,
                ];
            }
        }

        foreach ($risks as $r) {
            foreach ($matrix as &$cell) {
                if ($cell['likelihood'] == $r->likelihood && $cell['impact'] == $r->impact) {
                    $cell['count'] = $r->count;
                    break;
                }
            }
        }

        return response()->json(['data' => $matrix, 'errors' => null]);
    }

    /** GET /api/v1/dashboard/risk-trend — 12-month stacked by level */
    public function riskTrend(): JsonResponse
    {
        $months = collect(range(11, 0))->map(fn($i) => now()->subMonths($i)->startOfMonth());

        $trend = $months->map(function ($month) {
            $risks = Risk::where('created_at', '<=', $month->endOfMonth())->get();
            $open  = $risks->filter(fn($r) => $r->status !== 'Closed');

            return [
                'month'    => $month->format('Y-m'),
                'label'    => $month->format('M Y'),
                'Critical' => $open->filter(fn($r) => $r->risk_level === 'Critical')->count(),
                'High'     => $open->filter(fn($r) => $r->risk_level === 'High')->count(),
                'Medium'   => $open->filter(fn($r) => $r->risk_level === 'Medium')->count(),
                'Low'      => $open->filter(fn($r) => $r->risk_level === 'Low')->count(),
            ];
        });

        return response()->json(['data' => $trend, 'errors' => null]);
    }

    /** GET /api/v1/dashboard/top-risks — top 5 by inherent score */
    public function topRisks(): JsonResponse
    {
        $risks = Risk::with(['owner:id,full_name'])
            ->where('status', '!=', 'Closed')
            ->get()
            ->sortByDesc('inherent_score')
            ->take(5)
            ->values();

        return response()->json([
            'data' => $risks->map(fn($r) => [
                'id'             => $r->id,
                'risk_id'        => $r->risk_id,
                'title'          => $r->title,
                'category'       => $r->category,
                'inherent_score' => $r->inherent_score,
                'risk_level'     => $r->risk_level,
                'owner'          => $r->owner?->full_name,
                'status'         => $r->status,
            ]),
            'errors' => null,
        ]);
    }

    /** GET /api/v1/dashboard/upcoming — risks + assets due for review within 30 days */
    public function upcoming(): JsonResponse
    {
        $risks = Risk::with(['owner:id,full_name'])
            ->dueSoon(30)
            ->orderBy('review_date')
            ->get()
            ->map(fn($r) => [
                'type'        => 'risk',
                'id'          => $r->id,
                'ref'         => $r->risk_id,
                'title'       => $r->title,
                'owner'       => $r->owner?->full_name,
                'review_date' => $r->review_date?->format('Y-m-d'),
                'level'       => $r->risk_level,
            ]);

        $assets = Asset::with(['owner:id,full_name'])
            ->dueSoon(30)
            ->orderBy('review_date')
            ->get()
            ->map(fn($a) => [
                'type'        => 'asset',
                'id'          => $a->id,
                'ref'         => $a->asset_id,
                'title'       => $a->name,
                'owner'       => $a->owner?->full_name,
                'review_date' => $a->review_date?->format('Y-m-d'),
                'level'       => null,
            ]);

        $combined = $risks->concat($assets)->sortBy('review_date')->values();

        return response()->json(['data' => $combined, 'errors' => null]);
    }

    /** GET /api/v1/dashboard/treatment-status */
    public function treatmentStatus(): JsonResponse
    {
        return response()->json(['data' => $this->getTreatmentPlanStats(), 'errors' => null]);
    }

    private function getTreatmentPlanStats(): array
    {
        $risks = Risk::whereNotNull('treatment_plan')->where('status', '!=', 'Closed')->get();

        $overdue  = 0;
        $dueSoon  = 0;
        $onTrack  = 0;

        foreach ($risks as $risk) {
            foreach ($risk->treatment_plan ?? [] as $action) {
                if (($action['status'] ?? '') === 'Complete') {
                    continue;
                }
                $targetDate = isset($action['target_date']) ? \Carbon\Carbon::parse($action['target_date']) : null;
                if (!$targetDate) {
                    continue;
                }
                if ($targetDate->isPast()) {
                    $overdue++;
                } elseif ($targetDate->diffInDays(now()) <= 30) {
                    $dueSoon++;
                } else {
                    $onTrack++;
                }
            }
        }

        return compact('overdue', 'dueSoon', 'onTrack');
    }
}
