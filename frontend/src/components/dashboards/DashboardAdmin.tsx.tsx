// src/components/dashboard/DashboardAdmin.tsx
import { Row, Col, Card, Button } from "react-bootstrap";
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { dashboardData, SalesPerformance } from "../../pages/Dashboard";
import type { TableColumn } from "react-data-table-component";
import DataTable from "react-data-table-component";

// ✅ Register chart components once
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

interface DashboardAdminProps {
  data: dashboardData;
}

export default function DashboardAdmin({ data }: DashboardAdminProps) {
  const { summary, salesTrend, topAgents, leadConversion, performance } = data;

  // ================================
  // 📊 Chart Data
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
        labels: {
          boxWidth: 20,
          padding: 15,
          color: "#333",
        },
      },
    },
  };

  const paginationComponentOptions = {
    rowsPerPageText: "Rows per page",
    rangeSeparatorText: "of",
  };

  const customStyles = {
    table: {
      style: {
        minHeight: "300px",
        padding: "10px",
      },
    },
  };

  const columns: TableColumn<SalesPerformance>[] = [
    {
      name: "Agent",
      selector: (row) => row.agentName ?? "",
      sortable: true,
    },
    {
      name: "Policies Sold",
      selector: (row) => row.policiesSold ?? "",
    },
    {
      name: "Leads Converted",
      selector: (row) => row.leadsConverted ?? "",
    },
    {
      name: "Quota Percentage Plan",
      selector: (row) =>
        row.quotaPercentage != null ? `${row.quotaPercentage}%` : "",
    },
    {
      name: "Rank",
      selector: (row) => row.rank ?? "",
    },
  ];

  // ================================
  // 📤 Export Function
  // ================================
  const handleExport = () => {
    const summarySheet = XLSX.utils.json_to_sheet([
      {
        "Total Agents": summary?.totalAgents ?? 0,
        "Total Policies": summary?.totalHolders ?? 0,
        "Total Claims": summary?.totalClaims ?? 0,
        "Total Leads": summary?.totalLeads ?? 0,
      },
    ]);

    const salesSheet = XLSX.utils.json_to_sheet(
      salesTrend.map((s) => ({
        Month: s.month,
        "Policies Sold": s.total,
      }))
    );

    const agentsSheet = XLSX.utils.json_to_sheet(
      topAgents.map((a, index) => ({
        Rank: index + 1,
        Agent: a.name,
        "Policies Sold": a.totalPolicies,
      }))
    );

    const leadSheet = XLSX.utils.json_to_sheet(
      leadConversion.map((l) => ({
        Status: l.status,
        Count: l.count,
      }))
    );

    const performanceSheet = XLSX.utils.json_to_sheet(
      performance.map((p) => ({
        Rank: p.rank,
        Agent: p.agentName,
        "Policies Sold": p.policiesSold,
        "Leads Converted": p.leadsConverted,
        "Quota %": `${p.quotaPercentage}%`,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "KPI Summary");
    XLSX.utils.book_append_sheet(wb, salesSheet, "Sales Trend");
    XLSX.utils.book_append_sheet(wb, agentsSheet, "Top Agents");
    XLSX.utils.book_append_sheet(wb, leadSheet, "Lead Conversion");
    XLSX.utils.book_append_sheet(wb, performanceSheet, "Sales Performance");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout]), "Dashboard_Admin_Report.xlsx");
  };

  // ================================
  // 🧱 Render UI
  // ================================
  return (
    <>
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
        <Col md={4} className="mb-4">
          <Card className="shadow-sm p-3">
            <Card.Title>📈 Sales Trend</Card.Title>
            <Line data={salesData} />
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="shadow-sm p-3">
            <Card.Title>🏆 Top Performing Agents</Card.Title>
            <Bar data={agentData} />
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="shadow-sm p-3">
            <Card.Title>🎯 Lead Status </Card.Title>
            <div style={{ width: "250px", height: "250px", margin: "0 auto" }}>
              <Pie data={leadData} options={pieOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Performance Table */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm p-3">
            <Card.Title>📊 Sales Performance Report</Card.Title>
            <DataTable
              columns={columns}
              data={performance}
              pagination
              fixedHeader
              fixedHeaderScrollHeight="300px"
              paginationComponentOptions={paginationComponentOptions}
              customStyles={customStyles}
              highlightOnHover
              pointerOnHover
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
