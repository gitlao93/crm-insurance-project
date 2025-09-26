import { Button, Form, Modal } from "react-bootstrap";
import {
  leadService,
  LeadStatus,
  type CreateLeadRequest,
} from "../../services/leadServices";
import { useState } from "react";

interface LeadCreateModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; // refetch users after success
}
export default function LeadCreateModal({
  show,
  onClose,
  onSuccess,
}: LeadCreateModalProps) {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);
  const [formData, setFormData] = useState<CreateLeadRequest>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    agencyId: userObj.agencyId,
    agentId: userObj.id,
    policyPlanId: 1,
    status: LeadStatus.NEW,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateLeadRequest, string>>
  >({});

  const handleChange =
    (field: keyof CreateLeadRequest) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value;

      // Update form data
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Live validation
      const errorMsg = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    };

  const validateField = (
    field: keyof CreateLeadRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ): string => {
    switch (field) {
      case "firstName":
      case "lastName":
        if (!value) return "This field is required";
        if (!/^[A-Za-z\s'-]*$/.test(value)) {
          return "Only letters, spaces, apostrophes, and hyphens allowed";
        }
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
    try {
      if (!formData) return;

      await leadService.createLead(formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create user", err);
    }
  };
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Lead</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
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
              name="lastName"
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
              name="email"
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
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange("phoneNumber")}
              isInvalid={!!errors.phoneNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phoneNumber}
            </Form.Control.Feedback>
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
