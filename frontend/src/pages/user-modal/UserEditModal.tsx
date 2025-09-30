import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import { UserRole, userService, type User } from "../../services/userService";

interface UserEditModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export default function UserEditModal({
  show,
  onClose,
  onSuccess,
  user,
}: UserEditModalProps) {
  let userObj: Partial<User> = {};
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) userObj = JSON.parse(storedUser);
  } catch (err) {
    console.warn("Failed to parse stored user", err);
  }

  const [formData, setFormData] = useState<User | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof User, string>>>({});
  const [supervisors, setSupervisors] = useState<User[]>([]);

  const fetchSupervisors = useCallback(async () => {
    if (!userObj?.agencyId) return;
    try {
      const users = await userService.getUsers(userObj.agencyId);
      const filtered = users.filter(
        (u) => u.role === UserRole.COLLECTION_SUPERVISOR
      );
      setSupervisors(filtered);
    } catch (err) {
      console.error("Failed to fetch supervisors", err);
    }
  }, [userObj?.agencyId]);

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        supervisorId: user.supervisorId ?? user.supervisor?.id ?? null,
      });
    } else {
      setFormData(null);
    }
  }, [user]);

  useEffect(() => {
    if (show) fetchSupervisors();
  }, [show, fetchSupervisors]);

  const handleChange =
    (field: keyof User) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value;
      setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));

      const errorMsg = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    };

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

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      if (!user) throw new Error("No user data to compare changes");
      const changes = getChangedFields(user, formData);

      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }
      const payload = {
        ...changes,
        supervisorId:
          changes.role === UserRole.COLLECTION_SUPERVISOR
            ? Number(userObj.id) // logged-in supervisor becomes their own supervisor
            : Number(changes.supervisorId),
      };

      await userService.updateUser(user.id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  const validateField = (field: keyof User, value: unknown): string => {
    switch (field) {
      case "firstName":
      case "lastName":
        if (!value) return "This field is required";
        if (typeof value === "string" && !/^[A-Za-z\s'-]*$/.test(value)) {
          return "Only letters, spaces, apostrophes, and hyphens allowed";
        }
        break;
      case "email":
        if (!value) return "This field is required";
        if (typeof value === "string" && !/^\S+@\S+\.\S+$/.test(value))
          return "Invalid email format";
        break;
      case "phoneNumber":
        if (!value) return "This field is required";
        if (typeof value === "string" && !/^0\d{10}$/.test(value))
          return "Phone number must be 11 digits and start with 0";
        break;
      case "landlineNumber":
        if (value && typeof value === "string" && !/^\d{7,15}$/.test(value)) {
          return "Landline must be between 7 and 15 digits";
        }
        break;
      default:
        return "";
    }
    return "";
  };

  if (!formData) return null;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
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
              readOnly
              value={formData.email}
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
              onChange={handleChange("officeHours")}
            >
              <option value="8:00am to 5:00pm">8:00am to 5:00pm</option>
              <option value="10:00am to 7:00pm">10:00am to 7:00pm</option>
              <option value="1:00pm to 9:00pm">1:00pm to 9:00pm</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setFormData((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    role: newRole,
                    supervisorId:
                      newRole === UserRole.COLLECTION_SUPERVISOR
                        ? userObj.id ?? null
                        : prev.supervisorId,
                  };
                });
              }}
              isInvalid={!!errors.role}
            >
              <option value={UserRole.AGENT}>Agent</option>
              <option value={UserRole.COLLECTION_SUPERVISOR}>
                Collection Supervisor
              </option>
              <option value={UserRole.ADMIN}>Admin</option>
            </Form.Select>

            <Form.Control.Feedback type="invalid">
              {errors.role}
            </Form.Control.Feedback>
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
                    supervisorId: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              >
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
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
