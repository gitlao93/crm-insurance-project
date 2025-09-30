import { Button, Form, Modal } from "react-bootstrap";

import { useEffect, useState } from "react";
import {
  InteractionStatus,
  InteractionType,
  leadInteractionService,
  type CreateLeadInteractionRequest,
} from "../../services/leadServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface LeadCreateModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leadId: number;
  type: InteractionType;
}
export default function LeadInteractionCreateModal({
  show,
  onClose,
  onSuccess,
  leadId,
  type,
}: LeadCreateModalProps) {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);
  const [formData, setFormData] = useState<CreateLeadInteractionRequest>({
    leadId: leadId,
    agentId: userObj.id,
    type: type,
    description: "",
    notes: "",
    dueDate: new Date(),
    status: InteractionStatus.PENDING,
  });

  useEffect(() => {
    if (leadId) {
      setFormData((prev) => ({
        ...prev,
        leadId,
        type,
      }));
    }
  }, [leadId, type]);

  const handleChange =
    (field: keyof CreateLeadInteractionRequest) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value;

      // Update form data
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleDateChange =
    (field: keyof CreateLeadInteractionRequest) => (date: Date | null) => {
      setFormData((prev) => ({ ...prev, [field]: date }));
    };

  const handleSubmit = async () => {
    try {
      if (!formData) return;

      await leadInteractionService.createInteraction(formData);
      setFormData({
        leadId: leadId,
        agentId: userObj.id,
        type: type,
        description: "",
        notes: "",
        dueDate: new Date(),
        status: InteractionStatus.PENDING,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create user", err);
    }
  };
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Set {type} schedule</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Set Date/Time</Form.Label>
            <br />
            <DatePicker
              className="form-control mb-3"
              selected={formData.dueDate}
              onChange={handleDateChange("dueDate")}
              showTimeSelect // ✅ if you want date+time
              dateFormat="yyyy-MM-dd HH:mm"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={formData.description}
              onChange={handleChange("description")}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange("notes")}
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
