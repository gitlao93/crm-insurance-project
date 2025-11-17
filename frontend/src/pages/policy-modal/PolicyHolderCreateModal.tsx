import { useEffect, useState } from "react";
import { Button, Form, Modal, Row, Col } from "react-bootstrap";
import {
  policyPlanService,
  type PolicyPlan,
} from "../../services/policyServices";
import {
  policyHolderService,
  PolicyHolderStatus,
  type CreatePolicyHolderRequest,
} from "../../services/policyHolderService";
import {
  policyDependentService,
  type CreatePolicyDependentRequest,
} from "../../services/policyDependentService";
import {
  leadService,
  LeadStatus,
  type Lead,
} from "../../services/leadServices";

interface PolicyHolderCreateModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead?: Lead | null;
}

export default function PolicyHolderCreateModal({
  show,
  onClose,
  onSuccess,
  lead,
}: PolicyHolderCreateModalProps) {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);

  const [plans, setPlans] = useState<PolicyPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PolicyPlan | null>(null);

  const emptyForm: CreatePolicyHolderRequest = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    occupation: "",
    agencyId: userObj.agencyId,
    agentId: userObj.id,
    policyPlanId: 0,
    StartDate: "",
    EndDate: "",
    status: PolicyHolderStatus.ACTIVE,
    leadId: null,
    receiptNumber: "",
  };

  const [formData, setFormData] =
    useState<CreatePolicyHolderRequest>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePolicyHolderRequest, string>>
  >({});

  // ✅ Dependents state (for Family plans)
  const [dependents, setDependents] = useState<CreatePolicyDependentRequest[]>(
    []
  );

  // 1️⃣ Fetch plans once when modal opens
  useEffect(() => {
    if (!show) return;

    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const res = await policyPlanService.getPlans();
        setPlans(res);
      } catch (err) {
        console.error("Failed to fetch policy plans", err);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [show]);

  // 2️⃣ When plans are loaded, set initial selected plan ONCE
  useEffect(() => {
    if (lead && show) {
      setFormData((prev) => ({
        ...prev,
        leadId: lead.id,
        firstName: lead.firstName ?? "",
        lastName: lead.lastName ?? "",
        email: lead.email ?? "",
        phoneNumber: lead.phoneNumber ?? "",
      }));
    }
  }, [lead, show]);

  // ==========================
  // 🔧 Handlers
  // ==========================
  const handleChange =
    (field: keyof CreatePolicyHolderRequest) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      let value: string | number = e.target.value;

      if (["policyPlanId", "agencyId", "agentId", "leadId"].includes(field)) {
        value = Number(value);
      }

      setFormData((prev) => {
        const updated = { ...prev, [field]: value };

        // ✅ If StartDate changes and we have a selected plan, auto-calc EndDate
        if (field === "StartDate" && selectedPlan) {
          const startDate = new Date(value);
          const endDate = new Date(startDate);
          endDate.setFullYear(startDate.getFullYear() + selectedPlan.duration);
          updated.EndDate = endDate.toISOString().split("T")[0]; // format as yyyy-MM-dd
        }

        // ✅ If plan changes, also auto-recalculate EndDate if StartDate is set
        if (field === "policyPlanId") {
          const plan = plans.find((p) => p.id === Number(value)) ?? null;
          setSelectedPlan(plan);

          if (plan && updated.StartDate) {
            const startDate = new Date(updated.StartDate);
            const endDate = new Date(startDate);
            endDate.setFullYear(startDate.getFullYear() + plan.duration);
            updated.EndDate = endDate.toISOString().split("T")[0];
          }

          // Optional: reset dependents if not Family plan
          if (plan?.category?.categoryName !== "Family") {
            setDependents([]);
          }
        }

        return updated;
      });

      const errorMsg = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    };

  const handleDependentChange =
    (index: number, field: keyof CreatePolicyDependentRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDeps = [...dependents];
      newDeps[index] = { ...newDeps[index], [field]: e.target.value };
      setDependents(newDeps);
    };

  const addDependent = () =>
    setDependents((prev) => [
      ...prev,
      { firstName: "", lastName: "", relationship: "", policyHolderId: null },
    ]);

  const removeDependent = (index: number) =>
    setDependents((prev) => prev.filter((_, i) => i !== index));

  // ==========================
  // 🧠 Validation
  // ==========================
  const validateField = (
    field: keyof CreatePolicyHolderRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ): string => {
    switch (field) {
      case "firstName":
      case "lastName":
        if (!value) return "This field is required";
        if (!/^[A-Za-z\s'-]+$/.test(value))
          return "Only letters, spaces, apostrophes, and hyphens allowed";
        break;
      case "email":
        if (!value) return "This field is required";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format";
        break;
      case "phoneNumber":
        if (!value) return "This field is required";
        if (!/^0\d{10}$/.test(value))
          return "Phone number must be 11 digits and start with 0";
        break;
      case "StartDate":
      case "EndDate":
        if (!value) return "This field is required";
        break;
      default:
        return "";
    }
    return "";
  };

  // ==========================
  // 💾 Submit
  // ==========================
  const handleSubmit = async () => {
    try {
      // validate fields
      const hasError = Object.entries(formData).some(
        ([key, val]) =>
          validateField(key as keyof CreatePolicyHolderRequest, val) !== ""
      );
      if (hasError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newErrors: any = {};
        for (const [key, val] of Object.entries(formData)) {
          newErrors[key] = validateField(
            key as keyof CreatePolicyHolderRequest,
            val
          );
        }
        setErrors(newErrors);
        return;
      }

      const payload = {
        ...formData,
        StartDate: formData.StartDate
          ? new Date(formData.StartDate).toISOString()
          : undefined,
        EndDate: formData.EndDate
          ? new Date(formData.EndDate).toISOString()
          : undefined,
      };
      console.log("payload", payload);
      // Create Policy Holder
      const holder = await policyHolderService.create(payload);
      console.log("holder", holder);
      // Create dependents if Family plan
      if (selectedPlan?.category?.categoryName === "Family") {
        for (const dep of dependents) {
          if (dep.firstName && dep.lastName) {
            await policyDependentService.create({
              ...dep,
              policyHolderId: Number(holder.id),
            });
          }
        }
      }

      // Update lead status if exists
      if (lead) {
        await leadService.updateLead(lead.id, { status: LeadStatus.CONVERTED });
      }

      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Failed to create policy holder", err);
    }
  };

  const handleClose = () => {
    setFormData(emptyForm);
    setDependents([]);
    setErrors({});
    onClose();
  };

  // ==========================
  // 🧱 Render
  // ==========================
  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {lead ? "Create Policy Holder from Lead" : "Add Policy Holder"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Policy Plan */}
          <Form.Group className="mb-3">
            <Form.Label>Policy Plan</Form.Label>
            <Form.Select
              value={formData.policyPlanId}
              onChange={handleChange("policyPlanId")}
              disabled={loadingPlans || plans.length === 0}
            >
              <option value="">Select Plan</option>
              {plans.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                  disabled={p.status !== "Active"}
                >
                  {p.policyName} {p.status !== "Active" ? " (Inactive)" : ""}
                </option>
              ))}
            </Form.Select>
            {selectedPlan && (
              <Form.Text className="text-muted">
                Category: {selectedPlan.category?.categoryName ?? "N/A"}
              </Form.Text>
            )}
          </Form.Group>

          {/* Policy Holder Basic Fields */}
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.firstName}
              onChange={handleChange("firstName")}
              isInvalid={!!errors.firstName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.firstName}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.lastName}
              onChange={handleChange("lastName")}
              isInvalid={!!errors.lastName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.lastName}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              value={formData.phoneNumber}
              maxLength={11}
              onChange={handleChange("phoneNumber")}
              isInvalid={!!errors.phoneNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phoneNumber}
            </Form.Control.Feedback>
          </Form.Group>

  <Form.Group className="mb-3">
            <Form.Label>Occupation</Form.Label>
            <Form.Control
              type="text"
              value={formData.occupation}
              maxLength={11}
              onChange={handleChange("occupation")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phoneNumber}
            </Form.Control.Feedback>
          </Form.Group>


          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.StartDate}
                  onChange={handleChange("StartDate")}
                  isInvalid={!!errors.StartDate}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.EndDate}
                  readOnly
                  disabled
                />
                <Form.Text className="text-muted">
                  Auto-calculated based on plan duration
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Receipt Number</Form.Label>
            <Form.Control
              type="text"
              value={formData.receiptNumber ?? ""}
              onChange={handleChange("receiptNumber")}
              isInvalid={!!errors.receiptNumber}
              placeholder="Enter receipt number for initial payment"
            />
            <Form.Control.Feedback type="invalid">
              {errors.receiptNumber}
            </Form.Control.Feedback>
          </Form.Group>
            
        {/*  <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={handleChange("status")}
            >
              {Object.values(PolicyHolderStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Form.Select>
          </Form.Group> * /}

          {/* ✅ Dependents Section (only for Family) */}
        
            <>
              <hr />
              <h6>Dependents</h6>
              {dependents.map((dep, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col md={4}>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={dep.firstName}
                      onChange={handleDependentChange(index, "firstName")}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={dep.lastName}
                      onChange={handleDependentChange(index, "lastName")}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Relationship</Form.Label>
                    <Form.Control
                      type="text"
                      value={dep.relationship}
                      onChange={handleDependentChange(index, "relationship")}
                    />
                  </Col>
                  <Col md={1}>
                    {index > 0 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeDependent(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button
                variant="outline-primary"
                size="sm"
                onClick={addDependent}
              >
                + Add Another Dependent
              </Button>
            </>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
