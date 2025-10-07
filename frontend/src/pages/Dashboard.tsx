import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Spinner } from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { dashboardService } from "../services/dashboard";

// ==========================
// 📘 Types
// ==========================
export interface DashboardSummary {
  totalHolders: number;
  totalAgents: number;
  totalPlans: number;
}

export interface PoliciesByMonth {
  month: string;
  count: number;
}

export interface PolicyHoldersByAgent {
  firstName: string;
  lastName: string;
  total: number;
}

// ==========================
// 🚀 Component
// ==========================
export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  // const [monthlyPolicies, setMonthlyPolicies] = useState<PoliciesByMonth[]>([]);
  const [agents, setAgents] = useState<PolicyHoldersByAgent[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Register Chart.js modules
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  // ✅ Fetch Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, agentData] = await Promise.all([
          dashboardService.getSummary(),
          // dashboardService.getPoliciesByMonth(),
          dashboardService.getPolicyHoldersByAgent(),
        ]);

        setSummary(summaryData);
        // setMonthlyPolicies(monthlyData);
        setAgents(agentData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <div>Loading Dashboard...</div>
      </Container>
    );

  // ✅ Prepare Chart.js Data
  // const chartData = {
  //   labels: monthlyPolicies.map((m) => m.month),
  //   datasets: [
  //     {
  //       label: "Policies Created",
  //       data: monthlyPolicies.map((m) => m.count),
  //       borderColor: "#0d6efd",
  //       backgroundColor: "rgba(13, 110, 253, 0.2)",
  //       borderWidth: 2,
  //       pointRadius: 4,
  //       tension: 0.3,
  //     },
  //   ],
  // };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Policy Creation Trend (This Year)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  return (
    <Container fluid className="p-4">
      <PageHeading heading="Dashboard" />

      {/* ======================= */}
      {/* Summary Cards */}
      {/* ======================= */}
      <Row className="mt-4">
        <Col md={4} className="mb-4">
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title>Total Policy Holders</Card.Title>
              <h2 className="text-primary fw-bold">
                {summary?.totalHolders ?? 0}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title>Total Agents</Card.Title>
              <h2 className="text-success fw-bold">
                {summary?.totalAgents ?? 0}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title>Total Policy Plans</Card.Title>
              <h2 className="text-warning fw-bold">
                {summary?.totalPlans ?? 0}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ======================= */}
      {/* Monthly Policy Trend Graph + Top Agents */}
      {/* ======================= */}
      <Row className="mt-3">
        {/* 📈 Line Chart */}
        {/* <Col md={8} className="mb-4">
          <Card className="shadow-sm p-3">
            {monthlyPolicies.length === 0 ? (
              <div className="text-muted text-center">No data available</div>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </Card>
        </Col> */}

        {/* 🧑‍💼 Top Agents Table */}
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Top Agents by Policy Holders</Card.Title>
              {agents.length === 0 ? (
                <div className="text-muted mt-3">No data available</div>
              ) : (
                <Table striped hover responsive className="mt-3">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Agent</th>
                      <th>Policy Holders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 5)
                      .map((a, index) => (
                        <tr key={a.agentId}>
                          <td>{index + 1}</td>
                          <td>
                            {a.firstName} {a.lastName}
                          </td>
                          <td>{a.total}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
