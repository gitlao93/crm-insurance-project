import { useEffect, useState } from "react";
import { Button, Form, Modal, Row, Col } from "react-bootstrap";
import {
  ClaimType,
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

  // ✅ Load policyPlan data when opened
  useEffect(() => {
    if (policyPlan) {
      setFormData({ ...policyPlan });
    } else {
      setFormData(null);
    }
  }, [policyPlan]);

  // ✅ Handle input changes
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

  // ✅ Handle benefit value changes
  const handleBenefitChange = (type: ClaimType, amount: number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            benefits: {
              ...prev.benefits,
              [type]: amount,
            },
          }
        : prev
    );
  };

  // ✅ Add new benefit
  const handleAddBenefit = () => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            benefits: {
              ...prev.benefits,
              ["" as ClaimType]: 0,
            },
          }
        : prev
    );
  };

  // ✅ Remove a benefit
  const handleRemoveBenefit = (type: ClaimType | string) => {
    if (!formData) return;
    const updated = { ...formData.benefits };
    delete updated[type as ClaimType];
    setFormData((prev) => (prev ? { ...prev, benefits: updated } : prev));
  };

  // ✅ Detect changed fields only
  function getChangedFields<T extends object>(
    original: T,
    updated: T
  ): Partial<T> {
    const changed: Partial<T> = {};
    (Object.keys(updated) as (keyof T)[]).forEach((key) => {
      if (JSON.stringify(updated[key]) !== JSON.stringify(original[key])) {
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
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Policy Plan</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {formData && (
          <Form>
            {/* CATEGORY */}
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

            {/* PLAN NAME */}
            <Form.Group className="mb-3">
              <Form.Label>Plan Name</Form.Label>
              <Form.Control
                type="text"
                name="policyName"
                value={formData.policyName}
                onChange={handleChange("policyName")}
              />
            </Form.Group>

            {/* POLICY TYPE */}
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

            {/* TERM */}
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

            {/* PREMIUM */}
            <Form.Group className="mb-3">
              <Form.Label>Premium</Form.Label>
              <Form.Control
                type="number"
                name="premium"
                value={formData.premium}
                onChange={handleChange("premium")}
              />
            </Form.Group>

            {/* DURATION */}
            <Form.Group className="mb-3">
              <Form.Label>Duration (Years)</Form.Label>
              <Form.Control
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange("duration")}
              />
            </Form.Group>

            {/* COMMISSION RATE */}
            <Form.Group className="mb-3">
              <Form.Label>Commission Rate (%)</Form.Label>
              <Form.Control
                type="number"
                name="commission_rate"
                value={formData.commission_rate}
                onChange={handleChange("commission_rate")}
              />
            </Form.Group>

            {/* STATUS */}
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

            {/* ✅ DESCRIPTION */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description || ""}
                onChange={handleChange("description")}
                placeholder="Describe this policy plan..."
              />
            </Form.Group>

            {/* ✅ BENEFITS */}
            <Form.Group className="mb-3">
              <Form.Label>Benefits</Form.Label>
              {Object.entries(formData.benefits || {}).map(
                ([type, amount], idx) => (
                  <Row key={idx} className="mb-2 align-items-center">
                    <Col>
                      <Form.Select
                        value={type}
                        onChange={(e) => {
                          const newType = e.target.value as ClaimType;
                          const newBenefits = { ...formData.benefits };
                          const key = type as ClaimType;
                          const value = newBenefits[key];
                          delete newBenefits[key];
                          newBenefits[newType] = value;
                          setFormData((prev) =>
                            prev ? { ...prev, benefits: newBenefits } : prev
                          );
                        }}
                      >
                        <option value="">Select Claim Type</option>
                        {Object.values(ClaimType).map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Amount"
                        value={amount || ""}
                        onChange={(e) =>
                          handleBenefitChange(
                            type as ClaimType,
                            Number(e.target.value)
                          )
                        }
                      />
                    </Col>
                    <Col xs="auto">
                      <Button
                        variant="outline-danger"
                        onClick={() => handleRemoveBenefit(type)}
                      >
                        ✕
                      </Button>
                    </Col>
                  </Row>
                )
              )}
              <Button
                className="m-2"
                variant="outline-primary"
                size="sm"
                onClick={handleAddBenefit}
              >
                + Add Benefit
              </Button>
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
