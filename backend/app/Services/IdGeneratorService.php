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

        return $this->nextId($prefix, Risk::where('risk_id', 'like', "{$prefix}%")->pluck('risk_id')->all());
    }

    /**
     * Generate next asset ID in format IAR-YYYY-NNN.
     */
    public function nextAssetId(): string
    {
        $year = now()->year;
        $prefix = "IAR-{$year}-";

        return $this->nextId($prefix, Asset::where('asset_id', 'like', "{$prefix}%")->pluck('asset_id')->all());
    }

    /**
     * Parse the numeric suffix in PHP so the generator works across SQL Server
     * and local databases without vendor-specific CAST syntax.
     *
     * @param array<int, string> $existingIds
     */
    private function nextId(string $prefix, array $existingIds): string
    {
        $highest = 0;

        foreach ($existingIds as $id) {
            $suffix = substr($id, strlen($prefix));

            if (ctype_digit($suffix)) {
                $highest = max($highest, (int) $suffix);
            }
        }

        return $prefix . str_pad((string) ($highest + 1), 3, '0', STR_PAD_LEFT);
    }
}
