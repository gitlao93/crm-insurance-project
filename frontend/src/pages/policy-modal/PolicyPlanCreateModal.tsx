import { Button, Form, Modal, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import {
  ClaimType,
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
    policyType: PolicyType.BURIAL,
    term: PolicyTerm.MONTHLY,
    duration: 1,
    commission_rate: 0,
    premium: 0,
    status: "Active",
    categoryId: 0,
    description: "",
    benefits: {} as Partial<Record<ClaimType, number>>,
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

      // ✅ Ensure numbers stay numbers for numeric fields
      if (
        ["categoryId", "premium", "commission_rate", "duration"].includes(field)
      ) {
        value = Number(value);
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  // ✅ Handle benefit changes
  const handleBenefitChange = (type: ClaimType, amount: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        [type]: amount,
      },
    }));
  };

  // ✅ Add a new empty benefit row
  const handleAddBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        ["" as ClaimType]: 0,
      },
    }));
  };

  // ✅ Remove a benefit
  const handleRemoveBenefit = (type: ClaimType | string) => {
    const updated = { ...formData.benefits };
    delete updated[type as ClaimType]; // ✅ Explicit cast fixes it
    setFormData((prev) => ({ ...prev, benefits: updated }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData) return;
      console.log("Submitting Policy Plan:", formData);
      await policyPlanService.createPlan(formData);
      // reset
      setFormData({
        policyName: "",
        policyType: PolicyType.LIFE,
        term: PolicyTerm.MONTHLY,
        duration: 1,
        commission_rate: 0,
        premium: 0,
        status: "Active",
        categoryId: 0,
        description: "",
        benefits: {},
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create Plan", err);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create Policy Plan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* CATEGORY */}
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
          {/* <Form.Group className="mb-3">
            <Form.Label>Policy Type</Form.Label>
            <Form.Select
              name="policyType"
              value={formData.policyType}
              onChange={handleChange("policyType")}
            >
              <option value={PolicyType.LIFE}>{PolicyType.LIFE}</option>
              <option value={PolicyType.BURIAL}>{PolicyType.BURIAL}</option>
            </Form.Select>
          </Form.Group> */}

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
              <option value={PolicyTerm.ANNUALLY}>{PolicyTerm.ANNUALLY}</option>
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

          {/* COMMISSION */}
          <Form.Group className="mb-3">
            <Form.Label>Commission Rate (%)</Form.Label>
            <Form.Control
              type="number"
              name="commission_rate"
              value={formData.commission_rate}
              onChange={handleChange("commission_rate")}
            />
          </Form.Group>

          {/* ✅ DESCRIPTION */}
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
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
                        setFormData((prev) => ({
                          ...prev,
                          benefits: newBenefits,
                        }));
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
              className="m-5"
              variant="outline-primary"
              size="sm"
              onClick={handleAddBenefit}
            >
              + Add Benefit
            </Button>
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
