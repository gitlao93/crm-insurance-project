import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
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

  const emptyForm: CreatePolicyHolderRequest = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    agencyId: userObj.agencyId,
    agentId: userObj.id,
    policyPlanId: 0,
    StartDate: "",
    EndDate: "",
    dueDate: "",
    status: PolicyHolderStatus.ACTIVE,
    leadId: null,
  };

  const [formData, setFormData] =
    useState<CreatePolicyHolderRequest>(emptyForm);

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePolicyHolderRequest, string>>
  >({});

  // ✅ Fetch policy plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const res = await policyPlanService.getPlans();
        setPlans(res);
        if (res.length > 0) {
          setFormData((prev) => ({ ...prev, policyPlanId: res[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch policy plans", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    if (show) fetchPlans();
  }, [show]);

  // ✅ Reset form when modal opens/closes or lead changes
  useEffect(() => {
    if (show) {
      if (lead) {
        // Prefill with lead info
        setFormData({
          ...emptyForm,
          firstName: lead.firstName || "",
          lastName: lead.lastName || "",
          email: lead.email || "",
          phoneNumber: lead.phoneNumber || "",
          leadId: lead.id,
        });
      } else {
        // Fresh form
        setFormData(emptyForm);
      }
      setErrors({});
    } else {
      // Reset when modal closes
      setFormData(emptyForm);
      setErrors({});
    }
  }, [show, lead]);

  const handleChange =
    (field: keyof CreatePolicyHolderRequest) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      let value: string | number = e.target.value;
      if (
        field === "policyPlanId" ||
        field === "agencyId" ||
        field === "agentId" ||
        field === "leadId"
      ) {
        value = Number(value);
      }
      setFormData((prev) => ({ ...prev, [field]: value }));
      const errorMsg = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    };

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
      case "dueDate":
        if (!value) return "This field is required";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleSubmit = async () => {
    try {
      const invalid = Object.entries(formData).find(([key, val]) =>
        validateField(key as keyof CreatePolicyHolderRequest, val)
      );
      if (invalid) {
        const [key, msg] = invalid;
        setErrors((prev) => ({ ...prev, [key]: msg }));
        return;
      }

      const payload = {
        ...formData,
        StartDate: formData.StartDate
          ? new Date(formData.StartDate).toISOString()
          : formData.StartDate,
        EndDate: formData.EndDate
          ? new Date(formData.EndDate).toISOString()
          : formData.EndDate,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : formData.dueDate,
      };

      await policyHolderService.create(payload);
      if (lead) {
        const status = {
          status: LeadStatus.CONVERTED,
        };
        await leadService.updateLead(lead.id, status);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Failed to create policy holder", err);
    }
  };

  const handleClose = () => {
    setFormData(emptyForm);
    setErrors({});
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {lead ? "Create Policy Holder from Lead" : "Add Policy Holder"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Policy Plan</Form.Label>
            <Form.Select
              value={formData.policyPlanId}
              onChange={handleChange("policyPlanId")}
              disabled={loadingPlans || plans.length === 0}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.policyName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

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
              onChange={handleChange("phoneNumber")}
              isInvalid={!!errors.phoneNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phoneNumber}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={formData.StartDate}
              onChange={handleChange("StartDate")}
              isInvalid={!!errors.StartDate}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={formData.EndDate}
              onChange={handleChange("EndDate")}
              isInvalid={!!errors.EndDate}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Due Date</Form.Label>
            <Form.Control
              type="date"
              value={formData.dueDate}
              onChange={handleChange("dueDate")}
              isInvalid={!!errors.dueDate}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={handleChange("status")}
            >
              <option value={PolicyHolderStatus.ACTIVE}>Active</option>
              <option value={PolicyHolderStatus.RENEWALDUE}>Renewal Due</option>
              <option value={PolicyHolderStatus.LAPSABLE}>Lapsable</option>
              <option value={PolicyHolderStatus.LAPSED}>Lapsed</option>
              <option value={PolicyHolderStatus.CANCELLED}>Cancelled</option>
            </Form.Select>
          </Form.Group>
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
