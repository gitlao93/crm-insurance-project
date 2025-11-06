import { Button, ListGroup } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import type { ChannelMemberResponse } from "../../services/channelServices";
import type { ActiveChat } from "./types";

interface MemberListProps {
  channelId: number;
  members: ChannelMemberResponse[];
  activeChat: ActiveChat;
  onDeleteMember: (channelId: number, userId: number) => Promise<void> | void;
  onAddMember?: () => void;
}

export default function MemberList({
  channelId,
  members,
  activeChat,
  onDeleteMember,
  onAddMember,
}: MemberListProps) {
  if (!members || members.length === 0) {
    return (
      <div
        className="border-start p-3 text-muted d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100%" }}
      >
        No members yet
      </div>
    );
  }

  return (
    <div
      className="border-start p-3 d-flex flex-column"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100%" }}
    >
      <div className="border-bottom p-2 mb-5 fw-bold d-flex justify-content-between align-items-center">
        <span>{activeChat.name || "Select a Chat"}</span>
        {activeChat.type === "channel" && onAddMember && (
          <Button variant="outline-primary" size="sm" onClick={onAddMember}>
            + Add Member
          </Button>
        )}
      </div>
      <h6 className="mb-3">Members ({members.length})</h6>

      <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
        {members.map((member) => (
          <ListGroup.Item
            key={member.id}
            className="d-flex justify-content-between align-items-center"
          >
            <span>
              {member.user.firstName} {member.user.lastName}{" "}
              <span className="text-muted small">({member.role})</span>
            </span>
            <Trash
              size={16}
              style={{ cursor: "pointer", color: "gray" }}
              onClick={() => onDeleteMember(channelId, member.user.id)}
              onMouseEnter={(e) => (e.currentTarget.style.color = "red")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "gray")}
            />
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}
