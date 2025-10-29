// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
import { dashboardService } from "../services/dashboard";
import { UserRole } from "../services/userService";
import DashboardAdmin from "../components/dashboards/DashboardAdmin.tsx";
import DashboardCollectionSupervisor from "../components/dashboards/DashboardCollectionSupervisor.tsx";
import DashboardAgent from "../components/dashboards/DashboardAgent.tsx";
export interface DashboardSummary2 {
  lapsable: number;
  lapsed: number;
  tcpPercent: number;
  dapPercent: number;
}
export interface DashboardSummary {
  totalHolders: number;
  totalAgents: number;
  totalPlans: number;
  totalLeads: number;
  totalClaims: number;
}
export interface SalesTrend {
  month: string;
  total: number;
}
export interface TopAgent {
  name: string;
  totalPolicies: number;
}
export interface LeadConversion {
  status: string;
  count: number;
}

export interface SalesPerformance {
  agentId: number;
  agentName: string;
  policiesSold: number;
  leadsConverted: number;
  quotaPercentage: number;
  rank: number;
}

export interface dashboardData {
  summary: DashboardSummary;
  supSummary?: DashboardSummary2;
  salesTrend: SalesTrend[];
  topAgents: TopAgent[];
  leadConversion: LeadConversion[];
  performance: SalesPerformance[];
  collectionSummary?: DashboardSummary2;
  installmentRecovery?: {
    irPercentage: number;
  };
}

export default function Dashboard() {
  const storedUser = localStorage.getItem("user") ?? "";
  const user = JSON.parse(storedUser);
  const role = user.role;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<dashboardData>({
    summary: {
      totalHolders: 0,
      totalAgents: 0,
      totalPlans: 0,
      totalLeads: 0,
      totalClaims: 0,
    },
    supSummary: {
      lapsable: 0,
      lapsed: 0,
      tcpPercent: 0,
      dapPercent: 0,
    },
    salesTrend: [],
    topAgents: [],
    leadConversion: [],
    performance: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        let summaryPromise: Promise<DashboardSummary>;

        if (role === UserRole.AGENT) {
          summaryPromise = dashboardService.getPolicyHoldersByAgent();
        } else {
          summaryPromise = dashboardService.getSummary();
        }
        const [summary, salesTrend, topAgents, leadRes, performance] =
          await Promise.all([
            summaryPromise,

            dashboardService.getSalesTrend(),
            dashboardService.getTopAgents(),
            dashboardService.getLeadConversion(),
            dashboardService.getSalesPerformance(),
          ]);
        // Optional supervisor data
        let collectionSummary = null;
        let installmentRecovery = null;

        if (role === UserRole.COLLECTION_SUPERVISOR) {
          collectionSummary = await dashboardService.getCollectionSummary(
            user.id,
            "2025-10-01",
            "2025-10-30"
          );
          installmentRecovery = await dashboardService.getInstallmentRecovery(
            user.id,
            "2025-10-01",
            "2025-10-30"
          );
        }

        type RawLeadItem = {
          name?: string;
          value?: number;
          status?: string;
          count?: number;
        };
        const leadConversion = Array.isArray(leadRes?.data)
          ? (leadRes.data as RawLeadItem[]).map((item) => ({
              status: item.name || item.status || "Unknown",
              count: item.value ?? item.count ?? 0,
            }))
          : Array.isArray(leadRes)
          ? (leadRes as RawLeadItem[]).map((item) => ({
              status: item.status || item.name || "Unknown",
              count: item.count ?? item.value ?? 0,
            }))
          : [];
        setDashboardData({
          summary,
          salesTrend,
          topAgents,
          leadConversion,
          performance,
          collectionSummary,
          installmentRecovery,
        });
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [role, user.id]);

  if (loading)
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <div>Loading Dashboard...</div>
      </Container>
    );

  // 🔀 Render based on role
  return (
    <Container fluid className="p-4">
      <PageHeading heading="Dashboard Overview" />

      {role === UserRole.ADMIN && <DashboardAdmin data={dashboardData} />}
      {role === UserRole.COLLECTION_SUPERVISOR && (
        <DashboardCollectionSupervisor data={dashboardData} />
      )}
      {role === UserRole.AGENT && <DashboardAgent data={dashboardData} />}
    </Container>
  );
}
