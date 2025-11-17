import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { billingService, BillingStatus } from "../../services/billingService";
import type { Billing } from "../../services/billingService";

interface BillingPaymentModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  billings: Billing[];
}

export default function BillingPaymentModal({
  show,
  onClose,
  onSuccess,
  billings,
}: BillingPaymentModalProps) {
  const unpaidBillings = billings.filter((b) => Number(b.amountPaid) === 0);

  const [selectedBillingId, setSelectedBillingId] = useState<number | null>(
    null
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Keep selectedBillingId synced with latest billings when modal shows
  useEffect(() => {
    if (show) {
      const unpaid = billings.filter((b) => Number(b.amountPaid) === 0);
      setSelectedBillingId( null);
      setPaymentAmount("");
      setReceiptNumber("");
      setError(null);
    }
  }, [show, billings]);

  const handlePay = async () => {
    setError(null);
    const billing = unpaidBillings.find((b) => b.id === selectedBillingId);
    if (!billing) return setError("Please select a billing.");

    if (!receiptNumber.trim()) {
      return setError("Receipt number is required.");
    }

    // Validate amount
    if (Number(paymentAmount) !== Number(billing.amount)) {
      return setError(
        `Payment amount must be exactly ₱${Number(billing.amount).toFixed(2)}`
      );
    }
    try {
      setLoading(true);
      await billingService.update(billing.id, {
        amountPaid: Number(paymentAmount),
        paidDate: new Date().toISOString(),
        receiptNumber: receiptNumber.trim(),
        status: BillingStatus.PAID,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBillingId(Number(e.target.value));

    const billing = unpaidBillings.find((b) => b.id === Number(e.target.value));
    if (billing) {
      setPaymentAmount(billing.amount.toString());
    }
  };



  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>💳 Record Payment</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {unpaidBillings.length === 0 ? (
          <Alert variant="info">All billings are already paid.</Alert>
        ) : (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Select Billing (Due Date)</Form.Label>
              <Form.Select
                value={selectedBillingId ?? ""}
                onChange={ handleBillingChange}
              >
                <option value=""> -- Select Billing --</option>
                {unpaidBillings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {new Date(b.dueDate).toLocaleDateString()} — ₱
                    {Number(b.amount).toFixed(2)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* <Form.Group className="mb-3">
              <Form.Label>Enter Payment Amount</Form.Label>
              <Form.Control
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter exact payment amount"
                min="0"
              />
            </Form.Group> */}

            <Form.Group>
              <Form.Label>Receipt Number</Form.Label>
              <Form.Control
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="Enter receipt number"
              />
            </Form.Group>

            {error && (
              <Alert variant="danger" className="mt-3 py-2">
                {error}
              </Alert>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={handlePay}
          disabled={loading || unpaidBillings.length === 0}
        >
          {loading ? (
            <>
              <Spinner size="sm" animation="border" /> Processing...
            </>
          ) : (
            "Pay"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
