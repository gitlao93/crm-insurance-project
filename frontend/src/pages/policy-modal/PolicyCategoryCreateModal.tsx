import { Button, Form, Modal } from "react-bootstrap";
import { useState } from "react";
import {
  policyCategoryService,
  type CreatePolicyCategoryRequest,
} from "../../services/policyServices";

interface PolicyCatCreateModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; // refetch users after success
}
export default function PolicyCategoryCreateModal({
  show,
  onClose,
  onSuccess,
}: PolicyCatCreateModalProps) {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);
  const [formData, setFormData] = useState<CreatePolicyCategoryRequest>({
    categoryName: "",
    description: "",
    agencyId: userObj.agencyId,
  });

  const handleChange =
    (field: keyof CreatePolicyCategoryRequest) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value;

      // Update form data
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async () => {
    try {
      if (!formData) return;

      await policyCategoryService.createCategory(formData);
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
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange("categoryName")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={formData.description}
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
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
