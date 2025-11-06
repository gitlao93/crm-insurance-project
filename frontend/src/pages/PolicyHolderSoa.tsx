import { useEffect, useState } from "react";
import { Container, Card, Table, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "react-bootstrap-icons";
import PageHeading from "../widgets/PageHeading";
import type { PolicyHolder } from "../services/policyHolderService";

export default function PolicyHolderSoa() {
  const navigate = useNavigate();
  const [holder, setHolder] = useState<PolicyHolder | null>(null);

  // 🧠 Load holder from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("selectedPolicyHolder");
    if (stored) {
      setHolder(JSON.parse(stored));
    }

    // 🧹 Cleanup when navigating away from this page (e.g. via sidebar/menu)
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("selectedPolicyHolder");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 🧭 Back handler — clears storage then navigates back
  const handleBack = () => {
    sessionStorage.removeItem("selectedPolicyHolder");
    navigate(-1);
  };

  if (!holder)
    return (
      <Container className="text-center mt-5">
        <p>No policy holder data available.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );

  const soa = holder.soa;
  const billings = soa?.billings ?? [];

  return (
    <Container fluid className="p-4">
      <PageHeading
        heading={`${holder.firstName} ${holder.lastName} Statement Of Account`}
      />
      <Button
        className="text-decoration-none d-flex align-items-center me-2 mb-5"
        onClick={handleBack}
      >
        <ArrowLeft size={20} className="me-1" /> Back
      </Button>
      {/* Policy Holder Info */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="fw-bold">Policy Holder Info</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>Name:</strong> {holder.firstName} {holder.lastName}
              </p>
              <p>
                <strong>Email:</strong> {holder.email}
              </p>
              <p>
                <strong>Phone:</strong> {holder.phoneNumber}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Policy:</strong> {holder.policyPlan?.policyName}
              </p>
              <p>
                <strong>Status:</strong> {holder.status}
              </p>
              <p>
                <strong>Duration:</strong> {holder.policyPlan?.duration} year(s)
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* SOA Info */}
      {soa && (
        <Card className="mb-4 shadow-sm">
          <Card.Header className="fw-bold">SOA Details</Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <strong>Policy Number:</strong> {holder.policyNumber}
              </Col>
              <Col md={4}>
                <strong>Start Date:</strong>{" "}
                {new Date(soa.startDate).toLocaleDateString()}
              </Col>
              <Col md={4}>
                <strong>End Date:</strong>{" "}
                {new Date(soa.endDate).toLocaleDateString()}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col md={4}>
                <strong>Payment Term:</strong> {soa.paymentTerm}
              </Col>
              <Col md={4}>
                <strong>Total Premium:</strong> ₱
                {Number(soa.totalPremium).toLocaleString()}
              </Col>
              <Col md={4}>
                <strong>Balance:</strong> ₱
                {Number(soa.balance).toLocaleString()}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Billing Table */}
      <Card className="shadow-sm">
        <Card.Header className="fw-bold">Billing Schedule</Card.Header>
        <Card.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {billings.length === 0 ? (
            <div className="text-muted text-center py-3">
              No billing records found.
            </div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {billings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.installmentNumber}</td>
                    <td>₱{Number(b.amount).toLocaleString()}</td>
                    <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td>{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
