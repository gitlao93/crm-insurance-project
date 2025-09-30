import { Button, Form, Modal } from "react-bootstrap";
import { useEffect, useState } from "react";
import {
  policyPlanService,
  type CreatePolicyPlanRequest,
  type PolicyCategory,
} from "../../services/policyServices";

interface PolicyPlanCreateModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; // refetch users after success
  category: PolicyCategory[];
}
export default function PolicyPlanCreateModal({
  show,
  onClose,
  onSuccess,
  category,
}: PolicyPlanCreateModalProps) {
  const [formData, setFormData] = useState<CreatePolicyPlanRequest>({
    categoryId: 0,
    planName: "",
    monthlyRate: 0,
    currency: "PHP",
    coverageAmount: 0,
    status: "active",
  });

  // ✅ Auto-select first category when modal opens or when categories change
  useEffect(() => {
    if (category.length > 0) {
      setFormData((prev) => ({
        ...prev,
        categoryId: category[0].id,
      }));
    }
  }, [category, show]);

  const handleChange =
    (field: keyof CreatePolicyPlanRequest) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      let value: string | number = e.target.value;

      // ✅ Ensure numbers stay numbers
      if (["categoryId", "monthlyRate", "coverageAmount"].includes(field)) {
        value = Number(value);
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async () => {
    try {
      if (!formData) return;
      console.log(formData);
      await policyPlanService.createPlan(formData);
      setFormData({
        categoryId: 0,
        planName: "",
        monthlyRate: 0,
        currency: "PHP",
        coverageAmount: 0,
        status: "active",
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create Plan", err);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Plan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange("categoryId")}
            >
              {category.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.categoryName}: {s.id}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Plan Name</Form.Label>
            <Form.Control
              type="text"
              name="planName"
              value={formData.planName}
              onChange={handleChange("planName")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Monthly Rate</Form.Label>
            <Form.Control
              type="number"
              name="monthlyRate"
              value={formData.monthlyRate}
              onChange={handleChange("monthlyRate")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Coverage Amount</Form.Label>
            <Form.Control
              type="number"
              name="coverageAmount"
              value={formData.coverageAmount}
              onChange={handleChange("coverageAmount")}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Currency</Form.Label>
            <Form.Select
              name="currency"
              value={formData.currency}
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
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
