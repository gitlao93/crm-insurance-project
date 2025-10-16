import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import PageHeading from "../../widgets/PageHeading";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Bar, Line, Pie } from "react-chartjs-2";
import { useState } from "react";

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

interface SalesPerformance {
  agentId: number;
  agentName: string;
  policiesSold: number;
  leadsConverted: number;
  quotaPercentage: number;
  rank: number;
}

interface Props {
  summary: DashboardSummary | null;
  salesTrend: SalesTrend[];
  topAgents: TopAgent[];
  leadConversion: LeadConversion[];
  salesPerformance: SalesPerformance[];
  loading: boolean;
}

export default function AdminDashboard({
  summary,
  salesTrend,
  topAgents,
  leadConversion,
  salesPerformance,
  loading,
}: Props) {
  if (loading)
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <div>Loading Dashboard...</div>
      </Container>
    );

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

  const leadData = {
    labels: leadConversion.map((l) => l.status),
    datasets: [
      {
        data: leadConversion.map((l) => l.count),
        backgroundColor: ["#0d6efd", "#ffc107", "#28a745", "#dc3545"],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  const handleExport = () => {
    const summarySheet = XLSX.utils.json_to_sheet([
      {
        "Total Agents": summary?.totalAgents ?? 0,
        "Policies Sold": summary?.totalHolders ?? 0,
        "Claims Filed": summary?.totalClaims ?? 0,
        "Leads Registered": summary?.totalLeads ?? 0,
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "KPI Summary");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "Admin_Dashboard.xlsx"
    );
  };

  return (
    <Container fluid className="p-4">
      <PageHeading heading="Admin Dashboard Overview" />
      <Row className="mb-3">
        <Col className="text-end">
          <Button className="btn btn-success" onClick={handleExport}>
            Export Dashboard Data
          </Button>
        </Col>
      </Row>

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

      {/* Charts */}
      <Row className="mt-3">
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <Card.Title>📈 Sales Trend</Card.Title>
            <Line data={salesData} />
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <Card.Title>🏆 Top Performing Agents</Card.Title>
            <Bar data={agentData} />
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <Card.Title>🎯 Lead Conversion Rate</Card.Title>
            <div style={{ width: "250px", height: "250px", margin: "0 auto" }}>
              <Pie data={leadData} options={pieOptions} />
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
