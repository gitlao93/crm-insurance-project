import { useEffect, useState } from "react";

import { Badge, Col, ListGroup, Row, Spinner } from "react-bootstrap";
import {
  InteractionStatus,
  InteractionType,
  leadService,
  type Lead,
} from "../../services/leadServices";
import {
  Calendar2Check,
  Envelope,
  JournalCheck,
  Phone,
} from "react-bootstrap-icons";

interface LeadInteractionProps {
  lead: Lead;
}

export default function LeadInteraction({ lead }: LeadInteractionProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        // Example: call your API endpoint for interactions
        const data = await leadService.getLeadInteractions(lead.id);
        setInteractions(data);
      } catch (err) {
        console.error("Failed to fetch interactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [lead.id]);

  if (loading) return <Spinner animation="border" />;

  return (
    <ListGroup>
      {interactions.length === 0 ? (
        <p>No interactions yet.</p>
      ) : (
        interactions.map((interaction, idx) => (
          <ListGroup.Item key={idx}>
            {/* <strong>{interaction.type}</strong> - {interaction.description}
            <br />
            <small>{interaction.notes}</small> */}
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
                <h6>at {interaction.dueDate}</h6>
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
                <p>
                  <strong>{interaction.notes}</strong>
                </p>
              </Col>
            </Row>
          </ListGroup.Item>
        ))
      )}
    </ListGroup>
  );
}
