import { Button, ListGroup, Spinner, Row, Col } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import type { ActiveChat } from "./types";
import type { ChannelResponseDto } from "../../services/channelServices";
import type { User } from "../../services/userService";

interface Props {
  channels: ChannelResponseDto[] | null;
  users: User[];
  loadingChannels: boolean;
  loadingUsers: boolean;
  activeChat: ActiveChat;
  onSelectChat: (chat: ActiveChat) => void;
  onDeleteChannel: (id: number) => void;
  onOpenCreateChannel: () => void;
}

export default function ChatSidebar({
  channels,
  users,
  loadingChannels,
  loadingUsers,
  activeChat,
  onSelectChat,
  onDeleteChannel,
  onOpenCreateChannel,
}: Props) {
  return (
    <>
      <Row>
        <Col md={6}>
          <h5>Channels</h5>
        </Col>
        <Col md={6}>
          <Button
            variant="outline-secondary"
            size="sm"
            className="w-100 mb-3"
            onClick={onOpenCreateChannel}
          >
            + Create Channel
          </Button>
        </Col>
      </Row>

      {loadingChannels ? (
        <div className="d-flex justify-content-center py-3">
          <Spinner animation="border" />
        </div>
      ) : (
        <ListGroup className="mb-4">
          {channels?.length ? (
            channels.map((c) => (
              <ListGroup.Item
                key={c.id}
                active={activeChat.type === "channel" && activeChat.id === c.id}
                onClick={() =>
                  onSelectChat({
                    type: "channel",
                    id: c.id,
                    name: c.name,
                    members: c.members,
                  })
                }
                className="d-flex justify-content-between align-items-center"
              >
                {c.name}
                <Trash
                  size={16}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChannel(c.id);
                  }}
                  style={{ cursor: "pointer", color: "gray" }}
                />
              </ListGroup.Item>
            ))
          ) : (
            <div className="text-muted text-center py-2">No channels</div>
          )}
        </ListGroup>
      )}

      <h5>Users</h5>
      {loadingUsers ? (
        <div className="d-flex justify-content-center py-3">
          <Spinner animation="border" />
        </div>
      ) : (
        <ListGroup>
          {users?.length ? (
            users.map((u) => (
              <ListGroup.Item
                key={u.id}
                active={activeChat.type === "user" && activeChat.id === u.id}
                onClick={() =>
                  onSelectChat({
                    type: "user",
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`,
                  })
                }
              >
                {u.firstName} {u.lastName}
              </ListGroup.Item>
            ))
          ) : (
            <div className="text-muted text-center py-2">No users found</div>
          )}
        </ListGroup>
      )}
    </>
  );
}
