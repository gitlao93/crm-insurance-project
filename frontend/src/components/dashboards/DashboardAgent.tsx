// src/components/dashboard/DashboardAgent.tsx
import { Card, Col, Row } from "react-bootstrap";
import type { dashboardData } from "../../pages/Dashboard";

interface DashboardAgentProps {
  data: dashboardData;
}

export default function DashboardAgent({ data }: DashboardAgentProps) {
  const storedUser = localStorage.getItem("user") ?? "";
  const user = JSON.parse(storedUser);
  const { summary } = data;

  const mySummary = Array.isArray(summary)
    ? summary.find((item) => item.agentId === user?.id)
    : null;

  const myPerformance = Array.isArray(data.performance)
    ? data.performance.find((item) => item.agentId === user?.id)
    : null;
  console.log("Agent performance:", myPerformance);
  console.log("Agent data:", data);
  return (
    <>
      <Row className="mt-4">
        <Col md={8}>
          {" "}
          <Row className="mt-4">
            <Col md={6}>
              <Card className="shadow-sm text-center mb-3">
                <Card.Body>
                  <Card.Title>You Rank</Card.Title>
                  <h2>#{myPerformance?.rank}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm text-center mb-3">
                <Card.Body>
                  <Card.Title>Quota Achievement</Card.Title>
                  <h2>{myPerformance?.quotaPercentage}%</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col md={6}>
              <Card className="shadow-sm text-center mb-3">
                <Card.Body>
                  <Card.Title>Policies Sold</Card.Title>
                  <h2>{mySummary?.total}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm text-center mb-3">
                <Card.Body>
                  <Card.Title>Leads Converted</Card.Title>
                  <h2>{myPerformance?.leadsConverted}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col md={4}></Col>
      </Row>
    </>
  );
}
