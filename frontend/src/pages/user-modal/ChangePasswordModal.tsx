import { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { userService } from "../../services/userService";

interface ChangePasswordModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

export default function ChangePasswordModal({
  show,
  onClose,
  onSuccess,
  userId,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset form every time modal opens
  useEffect(() => {
    if (show) {
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setError(null);
    }
  }, [show]);

  const handleChangePassword = async () => {
    setError(null);

    // Validation
    if (!oldPassword.trim()) {
      return setError("Old password is required.");
    }

    if (newPassword.length < 6) {
      return setError("New password must be at least 6 characters.");
    }

    if (newPassword !== confirmNewPassword) {
      return setError("New passwords do not match.");
    }

    try {
      setLoading(true);

      await userService.changePassword(userId, {
        oldPassword,
        newPassword,
      });

      onSuccess();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);

      let message = "Password change failed.";

      if (err?.response?.data?.message) {
        message = err.response.data.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>🔐 Change Password</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Old Password</Form.Label>
          <Form.Control
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Re-enter new password"
          />
        </Form.Group>

        {error && (
          <Alert variant="danger" className="mt-3 py-2">
            {error}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" animation="border" /> Saving...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}