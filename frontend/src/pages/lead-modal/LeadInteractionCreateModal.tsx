import { Modal } from "react-bootstrap";

interface LeadInteractionCreateModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void; // refetch users after success
}
export default function LeadInteractionCreateModal({
  show,
  onClose,
  onSuccess,
}: LeadInteractionCreateModalProps) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Set Schedule</Modal.Title>
      </Modal.Header>
    </Modal>
  );
}
