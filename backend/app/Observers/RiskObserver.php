<?php

namespace App\Observers;

use App\Models\Risk;
use App\Services\AuditService;

class RiskObserver
{
    private array $originalAttributes = [];

    public function __construct(private readonly AuditService $audit) {}

    public function created(Risk $risk): void
    {
        $this->audit->logCreate($risk);
    }

    public function updating(Risk $risk): void
    {
        // Capture original before the update is applied
        $this->originalAttributes[$risk->id] = $risk->getOriginal();
    }

    public function updated(Risk $risk): void
    {
        $original = $this->originalAttributes[$risk->id] ?? [];
        $this->audit->logUpdate($risk, $original);
        unset($this->originalAttributes[$risk->id]);
    }

    public function deleted(Risk $risk): void
    {
        $this->audit->logDelete($risk);
    }
}
