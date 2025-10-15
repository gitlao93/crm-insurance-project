/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Container,
  Form,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
import {
  agencyService,
  type Agency,
  type UpdateAgencyRequest,
} from "../services/agencyService";
import { quotaService } from "../services/quotaService";

export default function AgencySetting() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [agency, setAgency] = useState<Agency | null>(null);
  const [formData, setFormData] = useState<UpdateAgencyRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(false);

  const [quotaMonth, setQuotaMonth] = useState("");
  const [targetPolicies, setTargetPolicies] = useState<number>(0);
  const [quotaMessage, setQuotaMessage] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [quotaSaving, setQuotaSaving] = useState(false);

  const agencyId = user?.agencyId;

  const handleCreateQuota = async () => {
    if (!quotaMonth || !targetPolicies || !user?.id) {
      setQuotaError("Please fill all fields.");
      return;
    }

    try {
      setQuotaSaving(true);
      setQuotaError(null);
      setQuotaMessage(null);

      // Split the selected month input "2025-10" into year and month
      const [year, month] = quotaMonth.split("-");

      await quotaService.create({
        year: Number(year),
        month,
        targetPolicies,
        adminId: user.id, // ✅ send adminId from frontend
      });

      setQuotaMessage("Quota created successfully!");
      setQuotaMonth("");
      setTargetPolicies(0);
    } catch (err) {
      const errorMsg =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Failed to create quota.";
      console.log("Failed to create quota:", errorMsg);
      setQuotaError(errorMsg);
    } finally {
      setQuotaSaving(false);
    }
  };

  // ✅ Fetch Agency details
  useEffect(() => {
    const fetchAgency = async () => {
      try {
        if (!agencyId) {
          setError("No agency ID found for this user.");
          setLoading(false);
          return;
        }

        setLoading(true);
        const data = await agencyService.getById(agencyId);
        setAgency(data);
        setFormData({
          agencyName: data.agencyName,
          street: data.street,
          cityMunicipality: data.cityMunicipality,
          postalCode: data.postalCode,
          email: data.email,
          phoneNumber: data.phoneNumber,
          landLine: data.landLine,
        });
      } catch (err) {
        console.log("Failed to load agency:", err);
        setError("Failed to fetch agency details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgency();
  }, [agencyId]);

  // ✅ Handle input changes
  const handleChange =
    (field: keyof UpdateAgencyRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };

        // Determine if there are changes compared to original
        const hasChanged = Object.keys(updated).some((key) => {
          // @ts-expect-error dynamic access
          return updated[key] !== agency?.[key];
        });
        setIsChanged(hasChanged);
        return updated;
      });
    };

  // ✅ Handle save/update
  const handleSave = async () => {
    if (!agencyId || !isChanged) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await agencyService.update(agencyId, formData);
      setAgency(updated);
      setSuccess("Agency details updated successfully!");
      setIsChanged(false);
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update agency details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="p-4">
      <PageHeading heading="Agency Management" />
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <div>Loading agency details...</div>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : agency ? (
        <Row className="mt-4">
          {/* 🔹 Agency Form */}
          <Col md={6}>
            <Form style={{ maxWidth: "650px" }}>
              {success && <Alert variant="success">{success}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>Agency Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.agencyName || ""}
                  onChange={handleChange("agencyName")}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange("email")}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange("phoneNumber")}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Landline</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.landLine || ""}
                  onChange={handleChange("landLine")}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Street</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.street || ""}
                  onChange={handleChange("street")}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>City / Municipality</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.cityMunicipality || ""}
                  onChange={handleChange("cityMunicipality")}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Postal Code</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.postalCode || ""}
                  onChange={handleChange("postalCode")}
                />
              </Form.Group>

              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!isChanged || saving}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Form>
          </Col>

          {/* 🔹 Quota Creation Form */}
          <Col md={6}>
            <Form className="border rounded p-3 shadow-sm bg-light">
              <h5 className="mb-3">🎯 Monthly Quota</h5>

              {quotaMessage && <Alert variant="success">{quotaMessage}</Alert>}
              {quotaError && <Alert variant="danger">{quotaError}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>Month</Form.Label>
                <Form.Control
                  type="month"
                  value={quotaMonth}
                  onChange={(e) => setQuotaMonth(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Target Policies</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={targetPolicies}
                  onChange={(e) => setTargetPolicies(Number(e.target.value))}
                />
              </Form.Group>

              <Button
                variant="success"
                onClick={handleCreateQuota}
                disabled={quotaSaving}
              >
                {quotaSaving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating...
                  </>
                ) : (
                  "Create Quota"
                )}
              </Button>
            </Form>
          </Col>
        </Row>
      ) : (
        <Alert variant="warning">No agency details found.</Alert>
      )}
    </Container>
  );
}
