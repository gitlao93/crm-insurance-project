// src/components/dashboard/DashboardAgent.tsx
import { useEffect, useState } from "react";
import { Card, Col, Row, ListGroup, Spinner } from "react-bootstrap";
import type { dashboardData } from "../../pages/Dashboard";
import { leadInteractionService } from "../../services/leadServices";
import { billingService } from "../../services/billingService";

interface DashboardAgentProps {
  data: dashboardData;
}

interface Interaction {
  id: number;
  type: string;
  description?: string;
  dueDate: string;
  lead?: { firstName?: string; lastName?: string };
}

interface NearDueBilling {
  id: number;
  dueDate: string;
  amount: number;
  status: string;
  soa?: {
    policyHolder?: {
      firstName?: string;
      lastName?: string;
    };
  };
}
export default function DashboardAgent({ data }: DashboardAgentProps) {
  const storedUser = localStorage.getItem("user") ?? "";
  const user = JSON.parse(storedUser);
  const { summary } = data;

  const [todayInteractions, setTodayInteractions] = useState<Interaction[]>([]);
  const [nearDueBillings, setNearDueBillings] = useState<NearDueBilling[]>([]);
  const [loadingBillings, setLoadingBillings] = useState(true);

  const mySummary = Array.isArray(summary)
    ? summary.find((item) => item.agentId === user?.id)
    : null;

  const myPerformance = Array.isArray(data.performance)
    ? data.performance.find((item) => item.agentId === user?.id)
    : null;

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?.id) {
          const [leadHistory, billings] = await Promise.all([
            leadInteractionService.getTodayInteractions(user.id),
            billingService.getNearDueBillings(user.id, 5),
          ]);
          console.log("Near Due Billings:", billings);
          setNearDueBillings(billings);
          setLoadingBillings(false);
          setTodayInteractions(leadHistory);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    loadData();
  }, [user?.id]);

  return (
    <>
      <Row className="mt-4">
        <Col md={8}>
          <Row className="mt-4">
            <Col md={6}>
              <Card className="shadow-sm text-center mb-3">
                <Card.Body>
                  <Card.Title>You Rank</Card.Title>
                  <h2>#{myPerformance?.rank ?? "—"}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm text-center mb-3">
                <Card.Body>
                  <Card.Title>Quota Achievement</Card.Title>
                  <h2>{myPerformance?.quotaPercentage ?? 0}%</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col md={6}>
              <Card className="shadow-sm text-center mb-3">
                <Card.Body>
                  <Card.Title>Policies Sold</Card.Title>
                  <h2>{mySummary?.total ?? 0}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm text-center mb-3">
                <Card.Body>
                  <Card.Title>Leads Converted</Card.Title>
                  <h2>{myPerformance?.leadsConverted ?? 0}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* ✅ Schedule Section */}
        <Col md={4}>
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Card.Title>📅 Today’s Schedule</Card.Title>

              {todayInteractions.length === 0 ? (
                <p className="text-muted mt-2">
                  No scheduled interactions today.
                </p>
              ) : (
                <ListGroup variant="flush" className="mt-3">
                  {todayInteractions.map((interaction) => (
                    <ListGroup.Item key={interaction.id}>
                      <strong>{interaction.type.toUpperCase()}</strong> with{" "}
                      {interaction.lead
                        ? `${interaction.lead.firstName} ${interaction.lead.lastName}`
                        : "Unknown Lead"}
                      <br />
                      <small className="text-muted">
                        {new Date(interaction.dueDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                      {interaction.description && (
                        <div className="text-muted small">
                          {interaction.description}
                        </div>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>

          {/* 💰 Near Due Billings Section */}
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>💰 Near Due Billings (Next 5 Days)</Card.Title>
              {loadingBillings ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" /> Loading...
                </div>
              ) : nearDueBillings.length === 0 ? (
                <p className="text-muted">No near-due billings.</p>
              ) : (
                <ListGroup variant="flush">
                  {nearDueBillings.map((billing) => (
                    <ListGroup.Item key={billing.id}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>
                            {billing.soa?.policyHolder?.firstName +
                              " " +
                              billing.soa?.policyHolder?.lastName}
                          </strong>
                          <div className="text-muted small">
                            Due:{" "}
                            {new Date(billing.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="fw-bold">
                            ₱{billing.amount.toLocaleString()}
                          </span>
                          <div
                            className={`small ${
                              billing.status === "OVERDUE"
                                ? "text-danger"
                                : "text-warning"
                            }`}
                          >
                            {billing.status}
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
