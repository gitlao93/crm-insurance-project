import { useEffect, useState } from "react";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
import {
  agencyService,
  type Agency,
  type UpdateAgencyRequest,
} from "../services/agencyService";

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

  const agencyId = user?.agencyId;

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
        console.error("Failed to load agency:", err);
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
        <Form className="mt-4" style={{ maxWidth: "650px" }}>
          {success && <Alert variant="success">{success}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Agency Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.agencyName || ""}
              onChange={handleChange("agencyName")}
              placeholder="Enter agency name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email || ""}
              onChange={handleChange("email")}
              placeholder="Enter agency email"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              value={formData.phoneNumber || ""}
              onChange={handleChange("phoneNumber")}
              placeholder="Enter phone number"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Landline</Form.Label>
            <Form.Control
              type="text"
              value={formData.landLine || ""}
              onChange={handleChange("landLine")}
              placeholder="Enter landline"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Street</Form.Label>
            <Form.Control
              type="text"
              value={formData.street || ""}
              onChange={handleChange("street")}
              placeholder="Street address"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>City / Municipality</Form.Label>
            <Form.Control
              type="text"
              value={formData.cityMunicipality || ""}
              onChange={handleChange("cityMunicipality")}
              placeholder="Enter city or municipality"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type="text"
              value={formData.postalCode || ""}
              onChange={handleChange("postalCode")}
              placeholder="Enter postal code"
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
      ) : (
        <Alert variant="warning">No agency details found.</Alert>
      )}
    </Container>
  );
}
