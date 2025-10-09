import { Button, Form, Modal } from "react-bootstrap";
import { useEffect, useState } from "react";
import {
  policyPlanService,
  PolicyTerm,
  PolicyType,
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
    policyName: "",
    policyType: PolicyType.LIFE,
    term: PolicyTerm.MONTHLY,
    duration: 1,
    commission_rate: 0,
    premium: 0,
    status: "Active",
    categoryId: 0,
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
        policyName: "",
        policyType: PolicyType.LIFE,
        term: PolicyTerm.MONTHLY,
        duration: 1,
        commission_rate: 0,
        premium: 0,
        status: "Active",
        categoryId: 0,
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
              <option value="">Select Category</option>
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
              name="policyName"
              value={formData.policyName}
              onChange={handleChange("policyName")}
            />
          </Form.Group>
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
              <option value={PolicyTerm.ANNUALLY}>{PolicyTerm.ANNUALLY}</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Premium</Form.Label>
            <Form.Control
              type="number"
              name="coverageAmount"
              value={formData.premium}
              onChange={handleChange("premium")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Duration(Years)</Form.Label>
            <Form.Control
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange("duration")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Commition Rate(%)</Form.Label>
            <Form.Control
              type="number"
              name="commission_rate"
              value={formData.commission_rate}
              onChange={handleChange("commission_rate")}
            />
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
