import { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import type { ActiveChat } from "./types";

import type { User } from "../../services/userService";
import type { MessageResponseDto } from "../../services/messageServices";
import type { DirectMessageResponseDto } from "../../services/directMessageService";

interface ChatWindowProps {
  user: User; // Replace with your User type if available
  activeChat: ActiveChat;
  messages: (MessageResponseDto | DirectMessageResponseDto)[];
  loading: boolean;
  onSendMessage: (message: string) => Promise<void> | void;
}

export default function ChatWindow({
  user,
  activeChat,
  messages,
  loading,
  onSendMessage,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await onSendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="d-flex flex-column flex-grow-1" style={{ height: "100%" }}>
      {/* Header */}
      <div className="border-bottom p-3 fw-bold">
        {activeChat.name || "Select a Chat"}
      </div>
      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-grow-1 p-3 overflow-y-scroll"
        style={{ maxHeight: "70vh", backgroundColor: "#fdfdfd" }}
      >
        {loading ? (
          <div className="text-muted text-center py-5">
            <Spinner animation="border" />
            <div className="mt-2">Loading messages...</div>
          </div>
        ) : activeChat.id === 0 ? (
          <div
            className="text-muted d-flex justify-content-center align-items-center"
            style={{ height: "50vh" }}
          >
            Select a chat to start messaging
          </div>
        ) : messages.length === 0 ? (
          <div
            className="text-muted d-flex justify-content-center align-items-center"
            style={{ height: "50vh" }}
          >
            No messages yet
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender.id === user.id;
            return (
              <div
                key={msg.id}
                className={`d-flex flex-column mb-3 ${
                  isMine ? "align-items-end" : "align-items-start"
                }`}
              >
                <div
                  className="px-3 py-2"
                  style={{
                    maxWidth: "70%",
                    borderRadius: "16px",
                    backgroundColor: isMine ? "#0d6efd" : "#e9ecef",
                    color: isMine ? "white" : "black",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
                {!isMine && (
                  <div className="text-muted small mb-1 mx-2">
                    {msg.sender.firstName} {msg.sender.lastName}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input box */}
      {activeChat.id !== 0 && (
        <div className="p-2 border-top bg-white">
          <InputGroup>
            <Form.Control
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button variant="primary" onClick={handleSend}>
              Send
            </Button>
          </InputGroup>
        </div>
      )}
    </div>
  );
}
