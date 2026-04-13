'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RiskSummaryCards       from '@/components/dashboard/RiskSummaryCards';
import RiskHeatMap            from '@/components/dashboard/RiskHeatMap';
import RiskTrendChart         from '@/components/dashboard/RiskTrendChart';
import ControlComplianceDonut from '@/components/dashboard/ControlComplianceDonut';
import TreatmentPlanStatus    from '@/components/dashboard/TreatmentPlanStatus';
import Top5Risks              from '@/components/dashboard/Top5Risks';
import UpcomingReviews        from '@/components/dashboard/UpcomingReviews';
import RegulatoryBadges       from '@/components/dashboard/RegulatoryBadges';
import {
  useDashboardSummary,
  useHeatMap,
  useRiskTrend,
  useTopRisks,
  useUpcomingReviews,
} from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { data: summary }  = useDashboardSummary();
  const { data: heatMap }  = useHeatMap();
  const { data: trend }    = useRiskTrend();
  const { data: topRisks } = useTopRisks();
  const { data: upcoming } = useUpcomingReviews();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">GRC Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your governance, risk &amp; compliance posture</p>
      </div>

      {/* Row 1: Risk KPI cards */}
      <RiskSummaryCards summary={summary} />

      {/* Row 2: Heat map + Risk trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Risk Heat Map</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskHeatMap cells={heatMap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Risk Trend (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskTrendChart data={trend} />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: ISO 27001 compliance + GDPR + Regulatory */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>ISO 27001 Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <ControlComplianceDonut summary={summary} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Treatment Plan Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <TreatmentPlanStatus stats={summary?.treatment_plan} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Regulatory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <RegulatoryBadges summary={summary} />
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Top risks + Upcoming reviews */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Top 5 Risks by Score</CardTitle>
          </CardHeader>
          <CardContent>
            <Top5Risks risks={topRisks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Upcoming Reviews (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingReviews items={upcoming} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
