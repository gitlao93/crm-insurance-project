import { Modal, Button, Form } from "react-bootstrap";
import type { User } from "../../../services/userService";

interface AddMemberModalProps {
  show: boolean;
  users: User[];
  selectedUserId: number | null;
  onSelectUser: (userId: number | null) => void;
  memberRole: "member" | "admin";
  onRoleChange: (role: "member" | "admin") => void;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  loading?: boolean;
}

export default function AddMemberModal({
  show,
  users,
  selectedUserId,
  onSelectUser,
  memberRole,
  onRoleChange,
  onClose,
  onSubmit,
  loading = false,
}: AddMemberModalProps) {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Channel Member</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Select User */}
          <Form.Group className="mb-3">
            <Form.Label>Select User</Form.Label>
            <Form.Select
              value={selectedUserId ?? ""}
              onChange={(e) => {
                console.log(e.target.value);
                onSelectUser(e.target.value ? Number(e.target.value) : null);
              }}
              disabled={loading}
            >
              <option value="">Select user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.role})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Select Role */}
          <Form.Group>
            <Form.Label>Role</Form.Label>
            <Form.Select
              value={memberRole}
              onChange={(e) =>
                onRoleChange(e.target.value as "member" | "admin")
              }
              disabled={loading}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={loading || !selectedUserId}
        >
          {loading ? "Adding..." : "Add Member"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
