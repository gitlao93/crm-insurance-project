import { Modal, Button, Form } from "react-bootstrap";
import { useCallback, useEffect, useState } from "react";
import {
  UserRole,
  userService,
  type CreateUserRequest,
  type User,
} from "../../services/userService";

interface UserCreateModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; // refetch users after success
}

export default function UserCreateModal({
  show,
  onClose,
  onSuccess,
}: UserCreateModalProps) {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);
  const [formData, setFormData] = useState<CreateUserRequest>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    landlineNumber: null,
    officeHours: "8:00am to 5:00pm",
    role: UserRole.AGENT,
    agencyId: userObj.agencyId, // ✅ if you already have agencyId from logged-in user
    supervisorId: null, // start as null
  });
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateUserRequest, string>>
  >({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange =
    (field: keyof CreateUserRequest) =>
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

  const handleSubmit = async () => {
    try {
      if (!formData) return;

      const payload = {
        ...formData,
        supervisorId:
          formData.role === UserRole.COLLECTION_SUPERVISOR
            ? Number(userObj.id) // logged-in supervisor becomes their own supervisor
            : Number(formData.supervisorId),
      };

      await userService.createUser(payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create user", err);
    }
  };

  const fetchSupervisors = useCallback(async () => {
    if (!formData.agencyId) return;
    try {
      const users = await userService.getUsers(userObj.agencyId);
      const filtered = users.filter(
        (u) => u.role === UserRole.COLLECTION_SUPERVISOR
      );
      setSupervisors(filtered);
    } catch (err) {
      console.error("Failed to fetch supervisors", err);
    }
  }, [formData.role]);

  const validateField = (
    field: keyof CreateUserRequest,
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
      case "landlineNumber":
        if (value && !/^\d{7,15}$/.test(value)) {
          return "Landline must be between 7 and 15 digits";
        }
        break;
      default:
        return "";
    }
    return "";
  };

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create User</Modal.Title>
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
          <Form.Group className="mb-3">
            <Form.Label>Landline</Form.Label>
            <Form.Control
              type="text"
              name="landlineNumber"
              value={formData.landlineNumber ?? ""}
              onChange={handleChange("landlineNumber")}
              isInvalid={!!errors.landlineNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.landlineNumber}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Office Hours</Form.Label>
            <Form.Select
              name="officeHours"
              value={formData.officeHours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  officeHours: e.target.value,
                })
              }
            >
              <option selected value="8:00am to 5:00pm">
                8:00am to 5:00pm
              </option>
              <option value="10:00am to 7:00pm">10:00am to 7:00pm</option>
              <option value="1:00pm to 9:00pm">1:00pm to 9:00pm</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as UserRole,
                })
              }
            >
              <option value="agent">Agent</option>
              <option value="collection_supervisor">
                Collection Supervisor
              </option>
            </Form.Select>
          </Form.Group>
          {formData.role === UserRole.AGENT && (
            <Form.Group className="mb-3">
              <Form.Label>Supervisor</Form.Label>
              <Form.Select
                name="supervisorId"
                value={formData.supervisorId ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supervisorId: Number(e.target.value),
                  })
                }
              >
                <option value="">-- Select Supervisor --</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
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
