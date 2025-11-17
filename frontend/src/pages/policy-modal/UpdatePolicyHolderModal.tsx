import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import {
  policyPlanService,
  type PolicyPlan,
} from "../../services/policyServices";
import {
  policyHolderService,
  PolicyHolderStatus,
  type CreatePolicyHolderRequest,
  type PolicyHolder,
} from "../../services/policyHolderService";

interface UpdatePolicyHolderModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  policyHolder: PolicyHolder | null;
}

export default function UpdatePolicyHolderModal({
  show,
  onClose,
  onSuccess,
  policyHolder,
}: UpdatePolicyHolderModalProps) {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);

  const [plans, setPlans] = useState<PolicyPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreatePolicyHolderRequest>({
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
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePolicyHolderRequest, string>>
  >({});

  // ✅ Fetch plans when opened
  useEffect(() => {
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
    if (show) fetchPlans();
  }, [show]);

  // ✅ Prefill or reset form when modal opens/closes
  useEffect(() => {
    if (show && policyHolder) {
      setFormData({
        firstName: policyHolder.firstName ?? "",
        lastName: policyHolder.lastName ?? "",
        email: policyHolder.email ?? "",
        phoneNumber: policyHolder.phoneNumber ?? "",
        occupation: policyHolder.occupation ?? "",
        agencyId: policyHolder.agencyId ?? userObj.agencyId,
        agentId: policyHolder.agentId ?? userObj.id,
        policyPlanId: policyHolder.policyPlanId ?? 0,
        StartDate: policyHolder.StartDate
          ? policyHolder.StartDate.split("T")[0]
          : "",
        status: policyHolder.status ?? PolicyHolderStatus.ACTIVE,
        leadId: policyHolder.leadId ?? null,
      });
      setErrors({});
    } else if (!show) {
      // Reset on close
      setFormData({
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
      });
      setErrors({});
    }
  }, [show, policyHolder, userObj.agencyId, userObj.id]);

  const handleChange =
    (field: keyof CreatePolicyHolderRequest) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const raw = e.target.value;
      let value: string | number | null = raw;

      if (["policyPlanId", "agencyId", "agentId"].includes(field)) {
        value = raw === "" ? 0 : Number(raw);
      } else if (field === "leadId") {
        value = raw === "" ? null : Number(raw);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormData((prev) => ({ ...prev, [field]: value as any }));
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
      
      default:
        return "";
    }
    return "";
  };

  const handleSubmit = async () => {
    if (!policyHolder) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalid = (Object.entries(formData) as [string, any][]).find(
        ([key, val]) =>
          validateField(key as keyof CreatePolicyHolderRequest, val)
      );
      if (invalid) {
        const [key, msg] = invalid;
        setErrors((prev) => ({ ...prev, [key]: msg }));
        return;
      }

      setLoading(true);
   
      

      await policyHolderService.update(policyHolder.id, formData);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Failed to update policy holder", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      occupation: "",
      agencyId: userObj.agencyId,
      agentId: userObj.id,
      policyPlanId: 0,
      status: PolicyHolderStatus.ACTIVE,
      leadId: null,
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Policy Holder</Modal.Title>
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
            <Form.Label>Occupation</Form.Label>
            <Form.Control
              type="text"
              value={formData.occupation}
              onChange={handleChange("occupation")}
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
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
