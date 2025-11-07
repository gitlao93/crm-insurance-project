import { Modal, Button, Form } from "react-bootstrap";

interface CreateChannelModalProps {
  show: boolean;
  channelName: string;
  onChange: (name: string) => void;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  loading?: boolean;
}

export default function CreateChannelModal({
  show,
  channelName,
  onChange,
  onClose,
  onSubmit,
  loading = false,
}: CreateChannelModalProps) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Channel</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Channel Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter channel name"
            value={channelName}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            autoFocus
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!channelName.trim() || loading}
        >
          {loading ? "Creating..." : "Create"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
