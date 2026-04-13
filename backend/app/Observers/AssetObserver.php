<?php

namespace App\Observers;

use App\Models\Asset;
use App\Services\AuditService;

class AssetObserver
{
    private array $originalAttributes = [];

    public function __construct(private readonly AuditService $audit) {}

    public function created(Asset $asset): void
    {
        $this->audit->logCreate($asset);
    }

    public function updating(Asset $asset): void
    {
        $this->originalAttributes[$asset->id] = $asset->getOriginal();
    }

    public function updated(Asset $asset): void
    {
        $original = $this->originalAttributes[$asset->id] ?? [];
        $this->audit->logUpdate($asset, $original);
        unset($this->originalAttributes[$asset->id]);
    }

    public function deleted(Asset $asset): void
    {
        $this->audit->logDelete($asset);
    }
}
