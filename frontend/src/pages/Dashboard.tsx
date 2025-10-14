import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Button } from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { dashboardService } from "../services/dashboard";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ==========================
// 📘 Types
// ==========================
interface DashboardSummary {
  totalHolders: number;
  totalAgents: number;
  totalPlans: number;
  totalLeads: number;
  totalClaims: number;
}
interface SalesTrend {
  month: string;
  total: number;
}
interface TopAgent {
  name: string;
  totalPolicies: number;
}
interface LeadConversion {
  status: string;
  count: number;
}

// ==========================
// 🚀 Component
// ==========================
export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [topAgents, setTopAgents] = useState<TopAgent[]>([]);
  const [leadConversion, setLeadConversion] = useState<LeadConversion[]>([]);
  const [loading, setLoading] = useState(true);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, salesRes, agentsRes, leadRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getSalesTrend(),
          dashboardService.getTopAgents(),
          dashboardService.getLeadConversion(),
        ]);

        setSummary(summaryRes);
        setSalesTrend(salesRes);
        setTopAgents(agentsRes);

        // ✅ Make sure leadRes is an array
        // setLeadConversion(Array.isArray(leadRes) ? leadRes : []);
        setLeadConversion(
          Array.isArray(leadRes?.data)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              leadRes.data.map((item: any) => ({
                status: item.name,
                count: item.value,
              }))
            : []
        );
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setLeadConversion([]); // prevent crash
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

  // ================================
  // 📈 Sales Trend (Line Chart)
  // ================================
  const salesData = {
    labels: salesTrend.map((s) => s.month),
    datasets: [
      {
        label: "Policies Sold",
        data: salesTrend.map((s) => s.total),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.2)",
        tension: 0.3,
      },
    ],
  };

  // ================================
  // 🧑‍💼 Top Agents (Bar Chart)
  // ================================
  const agentData = {
    labels: topAgents.map((a) => a.name),
    datasets: [
      {
        label: "Policies Sold",
        data: topAgents.map((a) => a.totalPolicies),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "#4bc0c0",
        borderWidth: 1,
      },
    ],
  };

  // ================================
  // 🧭 Lead Conversion (Pie Chart)
  // ================================
  const leadData = {
    labels: leadConversion.map((l) => l.status),
    datasets: [
      {
        data: leadConversion.map((l) => l.count),
        backgroundColor: ["#0d6efd", "#ffc107", "#28a745", "#dc3545"],
      },
    ],
  };

  const handleExport = () => {
    // 🧾 1️⃣ KPI Summary Sheet
    const summarySheet = XLSX.utils.json_to_sheet([
      {
        "Total Agents": summary?.totalAgents ?? 0,
        "Policies Sold": summary?.totalHolders ?? 0,
        "Claims Filed": summary?.totalClaims ?? 0,
        "Leads Registered": summary?.totalLeads ?? 0,
      },
    ]);

    // 📈 2️⃣ Sales Trend Sheet
    const salesSheet = XLSX.utils.json_to_sheet(
      salesTrend.map((s) => ({
        Month: s.month,
        "Policies Sold": s.total,
      }))
    );

    // 🏆 3️⃣ Top Performing Agents Sheet
    const agentsSheet = XLSX.utils.json_to_sheet(
      topAgents.map((a, index) => ({
        Rank: index + 1,
        Agent: a.name,
        "Policies Sold": a.totalPolicies,
      }))
    );

    // 🎯 4️⃣ Lead Conversion Rate Sheet
    const leadSheet = XLSX.utils.json_to_sheet(
      leadConversion.map((l) => ({
        Status: l.status,
        Count: l.count,
      }))
    );

    // 📘 Create Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "KPI Summary");
    XLSX.utils.book_append_sheet(wb, salesSheet, "Sales Trend");
    XLSX.utils.book_append_sheet(wb, agentsSheet, "Top Agents");
    XLSX.utils.book_append_sheet(wb, leadSheet, "Lead Conversion");

    // 💾 Export File
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "Dashboard_Report.xlsx"
    );
  };

  return (
    <Container fluid className="p-4">
      <PageHeading heading="Dashboard Overview" />

      {/* Summary Cards */}
      <Row className="mt-4">
        <Col md={3}>
          <Card className="shadow-sm text-center mb-3">
            <Card.Body>
              <Card.Title>Total Agents</Card.Title>
              <h2>{summary?.totalAgents ?? 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center mb-3">
            <Card.Body>
              <Card.Title>Total Policies</Card.Title>
              <h2>{summary?.totalHolders ?? 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center mb-3">
            <Card.Body>
              <Card.Title>Total Claims</Card.Title>
              <h2>{summary?.totalClaims ?? 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center mb-3">
            <Card.Body>
              <Card.Title>Total Leads</Card.Title>
              <h2>{summary?.totalLeads ?? 0}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col className="text-end">
          <Button className="btn btn-success" onClick={handleExport}>
            Export Dashboard Data
          </Button>
        </Col>
      </Row>
      {/* Charts Row */}
      <Row className="mt-3">
        {/* Line Chart */}

        <Col md={4} className="mb-4">
          <Card className="shadow-sm p-3">
            <Card.Title>📈 Sales Trend</Card.Title>
            <Line data={salesData} />
          </Card>
        </Col>

        {/* Bar Chart */}
        <Col md={4} className="mb-4">
          <Card className="shadow-sm p-3">
            <Card.Title>🏆 Top Performing Agents</Card.Title>
            <Bar data={agentData} />
          </Card>
        </Col>

        {/* Pie Chart */}

        <Col md={4} className="mb-4">
          <Card className="shadow-sm p-3">
            <Card.Title>🎯 Lead Conversion Rate</Card.Title>
            <Pie data={leadData} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
