<?php

namespace App\Observers;

use App\Models\Control;
use App\Services\AuditService;

class ControlObserver
{
    private array $originalAttributes = [];

    public function __construct(private readonly AuditService $audit) {}

    public function updating(Control $control): void
    {
        $this->originalAttributes[$control->id] = $control->getOriginal();
    }

    public function updated(Control $control): void
    {
        $original = $this->originalAttributes[$control->id] ?? [];
        $this->audit->logUpdate($control, $original);
        unset($this->originalAttributes[$control->id]);
    }
}
