import { useEffect, useState } from "react";
import {
  policyCategoryService,
  type PolicyCategory,
} from "../../services/policyServices";
import { Button, Form, Modal } from "react-bootstrap";

interface PolicyCategoryEditModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  policyCategory: PolicyCategory | null;
}
export default function PolicyCategroyEditModal({
  show,
  onClose,
  onSuccess,
  policyCategory,
}: PolicyCategoryEditModalProps) {
  const [formData, setFormData] = useState<PolicyCategory | null>(null);

  useEffect(() => {
    if (policyCategory) {
      setFormData(policyCategory);
    } else {
      setFormData(null);
    }
  }, [policyCategory]);

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

  const handleChange =
    (field: keyof PolicyCategory) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value;
      setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

  const handleSubmit = async () => {
    if (!formData) return;
    try {
      if (!policyCategory) throw new Error("No user data to compare changes");
      const changes = getChangedFields(policyCategory, formData);

      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }

      await policyCategoryService.updateCategory(policyCategory.id, changes);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData?.categoryName}
              onChange={handleChange("categoryName")}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={formData?.description}
              onChange={handleChange("description")}
            />
          </Form.Group>
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
