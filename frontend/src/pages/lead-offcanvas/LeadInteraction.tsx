import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Form,
  ListGroup,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  InteractionStatus,
  InteractionType,
  leadInteractionService,
  leadService,
  type Lead,
  type LeadInteraction,
} from "../../services/leadServices";
import {
  Calendar2Check,
  Envelope,
  JournalCheck,
  Phone,
} from "react-bootstrap-icons";
import { format } from "date-fns";

interface LeadInteractionProps {
  lead: Lead;
  refreshKey: number; // 👈 refresh trigger
}

export default function LeadInteraction({
  lead,
  refreshKey,
}: LeadInteractionProps) {
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  // --- State for editing notes ---
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  // --- State for Change Status modal ---
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedInteraction, setSelectedInteraction] =
    useState<LeadInteraction | null>(null);
  const [newStatus, setNewStatus] = useState<InteractionStatus>(
    InteractionStatus.PENDING
  );

  // ✅ move fetchInteractions here
  const fetchInteractions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await leadService.getLeadInteractions(lead.id);
      setInteractions(data);
    } catch (err) {
      console.error("Failed to fetch interactions", err);
    } finally {
      setLoading(false);
    }
  }, [lead.id]);

  useEffect(() => {
    fetchInteractions();
  }, [lead.id, refreshKey, fetchInteractions]);

  // --- Handlers ---
  const handleStartEditNote = (interaction: LeadInteraction) => {
    setEditingNoteId(interaction.id);
    setNotes(interaction.notes || "");
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setNotes("");
  };

  const handleSubmitNote = async (interactionId: number) => {
    try {
      await leadInteractionService.updateInteraction(interactionId, {
        notes, // must be an object property, not raw string
      });
      setEditingNoteId(null);
      await fetchInteractions();
      // refresh your interactions list after update if needed
      // await fetchInteractions();
    } catch (error) {
      console.error(error);
    } finally {
      setEditingNoteId(null);
    }
  };

  const handleOpenStatusModal = (interaction: LeadInteraction) => {
    setSelectedInteraction(interaction);
    setNewStatus(interaction.status);
    setShowStatusModal(true);
  };

  const handleSubmitStatus = async () => {
    if (!selectedInteraction) return;
    try {
      await leadInteractionService.updateInteraction(selectedInteraction.id, {
        status: newStatus, // must be an object property, not raw string
      });
      setEditingNoteId(null);
      await fetchInteractions();
    } catch (error) {
      console.error(error);
    } finally {
      setEditingNoteId(null);
      setShowStatusModal(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <ListGroup>
        {interactions.length === 0 ? (
          <p>No interactions yet.</p>
        ) : (
          interactions.map((interaction, idx) => (
            <ListGroup.Item key={idx}>
              <Row>
                <Col md={1}>
                  {interaction.type === InteractionType.CALL ? (
                    <Phone />
                  ) : interaction.type === InteractionType.EMAIL ? (
                    <Envelope />
                  ) : interaction.type === InteractionType.MEETING ? (
                    <Calendar2Check />
                  ) : interaction.type === InteractionType.FOLLOW_UP ? (
                    <JournalCheck />
                  ) : null}
                </Col>
                <Col md={8}>
                  <h4>{interaction.type}</h4>
                  <h6>
                    at{" "}
                    {format(new Date(interaction.dueDate), "yyyy-MM-dd HH:mm")}
                  </h6>
                </Col>
                <Col md={2}>
                  <Badge
                    bg={
                      interaction.status === InteractionStatus.COMPLETED
                        ? "success"
                        : interaction.status === InteractionStatus.PENDING
                        ? "warning"
                        : "info"
                    }
                  >
                    {interaction.status}
                  </Badge>
                </Col>
              </Row>
              <Row>
                <Col>
                  <small>Description:</small>
                  <p>
                    <strong>{interaction.description}</strong>
                  </p>
                  <small>Notes:</small>
                  {editingNoteId === interaction.id ? (
                    <>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSubmitNote(interaction.id)}
                        >
                          Submit
                        </Button>{" "}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleCancelEditNote}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p>
                      <strong>{interaction.notes}</strong>
                    </p>
                  )}
                </Col>
              </Row>
              <Row className="mt-2">
                <Col md={12}>
                  {editingNoteId === interaction.id ? null : (
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleStartEditNote(interaction)}
                    >
                      Add/Update Note
                    </Button>
                  )}
                  <Button
                    className="mx-2"
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => handleOpenStatusModal(interaction)}
                  >
                    Change Status
                  </Button>
                </Col>
              </Row>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>

      {/* --- Status Modal --- */}
      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as InteractionStatus)}
          >
            <option value={InteractionStatus.PENDING}>Pending</option>
            <option value={InteractionStatus.COMPLETED}>Completed</option>
            <option value={InteractionStatus.RESCHEDULED}>Rescheduled</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitStatus}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
