<?php

namespace App\Providers;

use App\Models\Asset;
use App\Models\Control;
use App\Models\Risk;
use App\Models\User;
use App\Observers\AssetObserver;
use App\Observers\ControlObserver;
use App\Observers\RiskObserver;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use SocialiteProviders\Manager\SocialiteWasCalled;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Register Eloquent observers for audit trail
        Risk::observe(RiskObserver::class);
        Asset::observe(AssetObserver::class);
        Control::observe(ControlObserver::class);

        // Register Socialite Microsoft Azure provider
        $this->app['events']->listen(SocialiteWasCalled::class, function (SocialiteWasCalled $event) {
            $event->extendSocialite('azure', \SocialiteProviders\Azure\Provider::class);
        });

        // Implicit admin gate — admin role bypasses all policy checks
        Gate::before(function (User $user, string $ability) {
            if ($user->hasRole('admin')) {
                return true;
            }
        });
    }
}
