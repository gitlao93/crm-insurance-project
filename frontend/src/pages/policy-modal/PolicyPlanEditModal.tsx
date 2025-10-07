import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
  policyPlanService,
  PolicyStatus,
  PolicyTerm,
  PolicyType,
  type PolicyCategory,
  type PolicyPlan,
} from "../../services/policyServices";

interface PolicyPlanEditModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  policyPlan: PolicyPlan | null;
  category: PolicyCategory[];
}

export default function PolicyPlanEditModal({
  show,
  onClose,
  onSuccess,
  policyPlan,
  category,
}: PolicyPlanEditModalProps) {
  const [formData, setFormData] = useState<PolicyPlan | null>(null);

  useEffect(() => {
    setFormData(policyPlan ? { ...policyPlan } : null);
  }, [policyPlan]);

  const handleChange =
    (field: keyof PolicyPlan) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value =
        e.target.type === "number" ? Number(e.target.value) : e.target.value;
      setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

  function getChangedFields<T extends object>(
    original: T,
    updated: T
  ): Partial<T> {
    const changed: Partial<T> = {};
    (Object.keys(updated) as (keyof T)[]).forEach((key) => {
      if (updated[key] !== original[key]) {
        changed[key] = updated[key];
      }
    });
    return changed;
  }

  const handleSubmit = async () => {
    if (!formData || !policyPlan) return;
    try {
      const changes = getChangedFields(policyPlan, formData);
      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }

      await policyPlanService.updatePlan(policyPlan.id, changes);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update policy plan", err);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Policy Plan</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {formData && (
          <Form>
            {/* Category */}
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="categoryId"
                value={formData.categoryId ?? ""}
                onChange={handleChange("categoryId")}
              >
                <option value="">Select Category</option>
                {category.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.categoryName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Policy Name */}
            <Form.Group className="mb-3">
              <Form.Label>Plan Name</Form.Label>
              <Form.Control
                type="text"
                name="policyName"
                value={formData.policyName}
                onChange={handleChange("policyName")}
              />
            </Form.Group>

            {/* Policy Type */}
            <Form.Group className="mb-3">
              <Form.Label>Policy Type</Form.Label>
              <Form.Select
                name="policyType"
                value={formData.policyType}
                onChange={handleChange("policyType")}
              >
                <option value={PolicyType.LIFE}>{PolicyType.LIFE}</option>
                <option value={PolicyType.BURIAL}>{PolicyType.BURIAL}</option>
              </Form.Select>
            </Form.Group>

            {/* Policy Term */}
            <Form.Group className="mb-3">
              <Form.Label>Term</Form.Label>
              <Form.Select
                name="term"
                value={formData.term}
                onChange={handleChange("term")}
              >
                <option value={PolicyTerm.MONTHLY}>{PolicyTerm.MONTHLY}</option>
                <option value={PolicyTerm.QUARTERLY}>
                  {PolicyTerm.QUARTERLY}
                </option>
                <option value={PolicyTerm.ANNUALLY}>
                  {PolicyTerm.ANNUALLY}
                </option>
              </Form.Select>
            </Form.Group>

            {/* Premium */}
            <Form.Group className="mb-3">
              <Form.Label>Premium</Form.Label>
              <Form.Control
                type="number"
                name="premium"
                value={formData.premium}
                onChange={handleChange("premium")}
              />
            </Form.Group>

            {/* Duration */}
            <Form.Group className="mb-3">
              <Form.Label>Duration (Years)</Form.Label>
              <Form.Control
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange("duration")}
              />
            </Form.Group>

            {/* Commission Rate */}
            <Form.Group className="mb-3">
              <Form.Label>Commission Rate (%)</Form.Label>
              <Form.Control
                type="number"
                name="commition_rate"
                value={formData.commition_rate}
                onChange={handleChange("commition_rate")}
              />
            </Form.Group>

            {/* Status */}
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange("status")}
              >
                <option value={PolicyStatus.ACTIVE}>
                  {PolicyStatus.ACTIVE}
                </option>
                <option value={PolicyStatus.RETIRED}>
                  {PolicyStatus.RETIRED}
                </option>
              </Form.Select>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
