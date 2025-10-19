import { useEffect, useState } from "react";
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
import DataTable, { type TableColumn } from "react-data-table-component";
import type { dashboardData, SalesPerformance } from "../../pages/Dashboard";
import { dashboardService } from "../../services/dashboard";

// Register chart.js components
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

interface DashboardCollectionSupervisorProps {
  data: dashboardData;
  supervisorId: number;
}

type CollectionsPerAgentItem = {
  agentName: string;
  totalCollected: number;
  [key: string]: unknown;
};

type PolicyStatusItem = {
  name: string;
  value: number;
  [key: string]: unknown;
};

type CollectionTrendItem = {
  month: string;
  totalCollected: number;
  [key: string]: unknown;
};

export default function DashboardCollectionSupervisor({
  data,
  supervisorId,
}: DashboardCollectionSupervisorProps) {
  const { collectionSummary, installmentRecovery, performance } = data;

  const [collectionsPerAgent, setCollectionsPerAgent] = useState<
    CollectionsPerAgentItem[]
  >([]);
  const [policyStatus, setPolicyStatus] = useState<PolicyStatusItem[]>([]);
  const [collectionTrend, setCollectionTrend] = useState<CollectionTrendItem[]>(
    []
  );

  // ================================
  // 🧩 Load Chart Data
  // ================================
  useEffect(() => {
    async function loadCharts() {
      try {
        const [collections, status, trend] = await Promise.all([
          dashboardService.getCollectionsPerAgent(supervisorId),
          dashboardService.getPolicyStatus(supervisorId),
          dashboardService.getMonthlyCollectionTrend(supervisorId),
        ]);
        setCollectionsPerAgent(collections);
        setPolicyStatus(status);
        setCollectionTrend(trend);
      } catch (err) {
        console.error("Error loading supervisor charts:", err);
      }
    }
    if (supervisorId) loadCharts();
  }, [supervisorId]);

  // ================================
  // 📊 Chart Configurations
  // ================================
  const barData = {
    labels: collectionsPerAgent.map((c) => c.agentName),
    datasets: [
      {
        label: "Total Collections",
        data: collectionsPerAgent.map((c) => c.totalCollected),
        backgroundColor: "rgba(75,192,192,0.6)",
        borderColor: "#4bc0c0",
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: policyStatus.map((p) => p.name),
    datasets: [
      {
        data: policyStatus.map((p) => p.value),
        backgroundColor: ["#0d6efd", "#dc3545"],
      },
    ],
  };

  const lineData = {
    labels: collectionTrend.map((t) => t.month),
    datasets: [
      {
        label: "Monthly Collections",
        data: collectionTrend.map((t) => t.totalCollected),
        borderColor: "#f28e2b",
        backgroundColor: "rgba(242,142,43,0.2)",
        tension: 0.3,
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

  // ================================
  // 📤 Export to Excel
  // ================================
  const handleExport = () => {
    const summarySheet = XLSX.utils.json_to_sheet([
      {
        Lapsable: collectionSummary?.lapsable ?? 0,
        Lapsed: collectionSummary?.lapsed ?? 0,
        "TCP%": collectionSummary?.tcpPercent ?? 0,
        "DAP%": collectionSummary?.dapPercent ?? 0,
        "Installment Recovery%": installmentRecovery?.irPercentage ?? 0,
      },
    ]);

    const collectionsSheet = XLSX.utils.json_to_sheet(collectionsPerAgent);
    const policySheet = XLSX.utils.json_to_sheet(policyStatus);
    const trendSheet = XLSX.utils.json_to_sheet(collectionTrend);
    const performanceSheet = XLSX.utils.json_to_sheet(performance);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, "Collection Summary");
    XLSX.utils.book_append_sheet(wb, collectionsSheet, "Collections Per Agent");
    XLSX.utils.book_append_sheet(wb, policySheet, "Policy Status");
    XLSX.utils.book_append_sheet(wb, trendSheet, "Collection Trend");
    XLSX.utils.book_append_sheet(wb, performanceSheet, "Performance Report");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout]), "Dashboard_Supervisor_Report.xlsx");
  };

  // ================================
  // 🧾 Data Table Setup
  // ================================
  const columns: TableColumn<SalesPerformance>[] = [
    { name: "Agent", selector: (row) => row.agentName ?? "", sortable: true },
    { name: "Policies Sold", selector: (row) => row.policiesSold ?? "" },
    { name: "Leads Converted", selector: (row) => row.leadsConverted ?? "" },
    {
      name: "Quota Percentage Plan",
      selector: (row) =>
        row.quotaPercentage != null ? `${row.quotaPercentage}%` : "",
    },
    { name: "Rank", selector: (row) => row.rank ?? "" },
  ];

  const customStyles = {
    table: {
      style: {
        minHeight: "300px",
        padding: "10px",
      },
    },
  };

  const paginationComponentOptions = {
    rowsPerPageText: "Rows per page",
    rangeSeparatorText: "of",
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

      {/* Collection Summary */}
      <Row className="mt-4">
        <Col md={3}>
          <Card className="shadow-sm text-center mb-3">
            <Card.Body>
              <Card.Title>Lapsable</Card.Title>
              <h2>{collectionSummary?.lapsable ?? 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center mb-3">
            <Card.Body>
              <Card.Title>Lapsed</Card.Title>
              <h2>{collectionSummary?.lapsed ?? 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center mb-3">
            <Card.Body>
              <Card.Title>TCP%</Card.Title>
              <h2>{collectionSummary?.tcpPercent ?? 0}%</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center mb-3">
            <Card.Body>
              <Card.Title>IR%</Card.Title>
              <h2>{installmentRecovery?.irPercentage ?? 0}%</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mt-3">
        <Col md={4} className="mb-4">
          <Card className="shadow-sm p-3">
            <Card.Title>💰 Collections per Agent</Card.Title>
            <Bar data={barData} />
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="shadow-sm p-3">
            <Card.Title>📉 Lapsed vs Active Policies</Card.Title>
            <div style={{ width: "250px", height: "250px", margin: "0 auto" }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="shadow-sm p-3">
            <Card.Title>📈 Monthly Collection Trend</Card.Title>
            <Line data={lineData} />
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
