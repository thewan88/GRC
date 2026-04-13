<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\Risk;

class IdGeneratorService
{
    /**
     * Generate next risk ID in format RR-YYYY-NNN.
     * Queries the highest existing sequence for the current year.
     */
    public function nextRiskId(): string
    {
        $year = now()->year;
        $prefix = "RR-{$year}-";

        $last = Risk::where('risk_id', 'like', "{$prefix}%")
            ->orderByRaw("CAST(SUBSTRING(risk_id, " . (strlen($prefix) + 1) . ", 10) AS UNSIGNED) DESC")
            ->value('risk_id');

        $next = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;

        return $prefix . str_pad($next, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Generate next asset ID in format IAR-YYYY-NNN.
     */
    public function nextAssetId(): string
    {
        $year = now()->year;
        $prefix = "IAR-{$year}-";

        $last = Asset::where('asset_id', 'like', "{$prefix}%")
            ->orderByRaw("CAST(SUBSTRING(asset_id, " . (strlen($prefix) + 1) . ", 10) AS UNSIGNED) DESC")
            ->value('asset_id');

        $next = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;

        return $prefix . str_pad($next, 3, '0', STR_PAD_LEFT);
    }
}
