import SimpleBar from "simplebar-react";
import { ListGroup, Row, Col } from "react-bootstrap";
import type { Notification } from "../../../services/notificationService";

interface NotificationListProps {
  notificationItems: Notification[];
  onNotificationClick: (id: number, link?: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notificationItems,
  onNotificationClick,
}) => {
  return (
    <SimpleBar style={{ maxHeight: "300px" }}>
      <ListGroup variant="flush">
        {notificationItems.length === 0 ? (
          <ListGroup.Item>No notifications</ListGroup.Item>
        ) : (
          notificationItems.map((item, index) => (
            <ListGroup.Item
              key={index}
              className={item.isRead ? "" : "bg-light"}
              action
              onClick={() => onNotificationClick(item.id, item.link)}
            >
              <Row>
                <Col>
                  <h6 className="mb-1 fw-bold">{item.title}</h6>
                  <p className="mb-0 small text-muted">{item.message}</p>
                </Col>
              </Row>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </SimpleBar>
  );
};
