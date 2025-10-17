// src/components/dashboard/DashboardCollectionSupervisor.tsx
import { Card, Col, Row } from "react-bootstrap";
import type { dashboardData, SalesPerformance } from "../../pages/Dashboard";
import DataTable, { type TableColumn } from "react-data-table-component";

export default function DashboardCollectionSupervisor({
  data,
}: {
  data: dashboardData;
}) {
  const { collectionSummary, installmentRecovery, performance } = data;

  if (!collectionSummary) return <p>No collection data available.</p>;

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

  return (
    <>
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm p-4">
            <Card.Title>📋 Collection Summary</Card.Title>
            <hr />
            <p>Lapsable: {collectionSummary.lapsable}</p>
            <p>Lapsed: {collectionSummary.lapsed}</p>
            <p>TCP%: {collectionSummary.tcpPercent}%</p>
            <p>DAP%: {collectionSummary.dapPercent}%</p>
            <p>
              Installment Recovery Rate:{" "}
              {installmentRecovery?.irPercentage ?? 0}%
            </p>
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
