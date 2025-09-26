import { useEffect, useState } from "react";

import { Button, Form, Modal } from "react-bootstrap";
import {
  policyPlanService,
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
  policyPlan: policyPlan,
  category: category,
}: PolicyPlanEditModalProps) {
  const [formData, setFormData] = useState<PolicyPlan | null>(null);

  useEffect(() => {
    if (policyPlan) {
      setFormData(policyPlan);
    } else {
      setFormData(null);
    }
  }, [policyPlan]);

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

  const handleChange =
    (field: keyof PolicyPlan) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value;
      setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      if (!policyPlan) throw new Error("No user data to compare changes");
      const changes = getChangedFields(policyPlan, formData);

      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }

      await policyPlanService.updatePlan(policyPlan.id, changes);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="supervisorId"
              value={formData?.categoryId}
              onChange={handleChange("categoryId")}
            >
              {category.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.categoryName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Plan Name</Form.Label>
            <Form.Control
              type="text"
              name="planName"
              value={formData?.planName}
              onChange={handleChange("planName")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Monthly Rate</Form.Label>
            <Form.Control
              type="text"
              name="monthlyRate"
              value={formData?.monthlyRate}
              onChange={handleChange("monthlyRate")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Coverage Amount</Form.Label>
            <Form.Control
              type="text"
              name="coverageAmount"
              value={formData?.coverageAmount}
              onChange={handleChange("coverageAmount")}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Currency</Form.Label>
            <Form.Select
              name="currency"
              value={formData?.currency}
              onChange={handleChange("currency")}
            >
              <option value="PHP">PHP</option>
              <option value="USD">USD</option>
            </Form.Select>
          </Form.Group>
        </Form>
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
