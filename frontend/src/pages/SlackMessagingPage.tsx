import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
  Form,
  Modal,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
import { userService, type User } from "../services/userService";
import type { Channel, Message } from "../types/slack";
import { connectSocket, getSocket } from "../services/socketService";
import slackService from "../services/slackService";

export default function SlackMessagingPage() {
  const storedUser = localStorage.getItem("user") ?? "{}";
  const currentUser: User = JSON.parse(storedUser);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [dmChannels, setDmChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [unreads, setUnreads] = useState<Record<number, boolean>>({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserForDM, setSelectedUserForDM] = useState<number | null>(
    null
  );
  const [showDMModal, setShowDMModal] = useState(false);

  const socketReady = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // connect socket
  useEffect(() => {
    connectSocket();
    socketReady.current = true;
  }, []);

  // load channels
  const loadChannels = useCallback(async () => {
    try {
      const data = await slackService.listChannels();

      // show only channels where current user is a member
      const memberFiltered = data.filter((ch) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ch.members?.some((m: any) => m.userId === currentUser.id)
      );

      setChannels(memberFiltered.filter((c) => !c.isDirect));
      setDmChannels(memberFiltered.filter((c) => c.isDirect));
    } catch (err) {
      console.error("Failed to load channels", err);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  // socket events
  useEffect(() => {
    if (!socketReady.current) return;
    const socket = getSocket();

    const onMessage = (message: Message) => {
      if (selectedChannel && message.channelId === selectedChannel.id) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnreads((u) => ({ ...u, [message.channelId]: true }));
      }
    };

    socket.on("slack:message", onMessage);
    return () => {
      socket.off("slack:message", onMessage);
    };
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // open a channel
  const openChannel = async (channel: Channel) => {
    setSelectedChannel(channel);
    setMessages([]);
    setLoadingMessages(true);

    try {
      const socket = getSocket();
      socket.emit("slack:join", { channelId: channel.id });
      const msgs = await slackService.listMessages(channel.id, 50);
      setMessages(msgs);
      setUnreads((u) => {
        const next = { ...u };
        delete next[channel.id];
        return next;
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMembers(channel.members?.map((m: any) => m.user) || []);
    } catch (err) {
      console.error("Failed to open channel", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedChannel || !msgInput.trim()) return;
    const payload = { channelId: selectedChannel.id, content: msgInput.trim() };
    try {
      const socket = getSocket();
      socket.emit("slack:message", payload);
      console.log("Message sent", payload);
      const optimistic: Message = {
        id: Date.now(),
        channelId: selectedChannel.id,
        senderId: currentUser.id,
        content: msgInput.trim(),
        createdAt: new Date().toISOString(),
        sender: {
          id: currentUser.id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
        },
      };
      setMessages((m) => [...m, optimistic]);
      setMsgInput("");
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      await slackService.createChannel({ name: newChannelName.trim() });
      await loadChannels();
      setCreatingChannel(false);
      setNewChannelName("");
    } catch (err) {
      console.error("Create channel failed", err);
    }
  };

  const openAddMemberModal = async () => {
    setAddingMember(true);
    try {
      const res = await userService.getUsers(currentUser.agencyId);
      console.log("Available users for adding:", res);
      setAvailableUsers(res);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const openAddDirectMessage = async () => {
    setShowDMModal(true);
    try {
      const res = await userService.getUsers(currentUser.agencyId);
      console.log("Available users for adding:", res);
      setAvailableUsers(res);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const addMember = async (userId: number) => {
    if (!selectedChannel) return;
    try {
      await slackService.addMember(selectedChannel.id, userId);
      await loadChannels();
      openChannel(selectedChannel);
      setAddingMember(false);
    } catch (err) {
      console.error("Add member failed", err);
    }
  };

  const createDM = async () => {
    if (!selectedUserForDM) return;
    try {
      const ch = await slackService.createOrGetDM(selectedUserForDM);
      setShowDMModal(false);
      setSelectedUserForDM(null);
      await loadChannels();
      openChannel(ch);
    } catch (err) {
      console.error("DM creation failed", err);
    }
  };

  const senderName = (m: Message) =>
    m.sender?.firstName || m.sender?.lastName
      ? `${m.sender.firstName ?? ""} ${m.sender.lastName ?? ""}`.trim()
      : m.senderId === currentUser.id
      ? "You"
      : `User ${m.senderId}`;

  const myMembership = selectedChannel?.members?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any) => m.userId === currentUser.id
  );
  const isOwnerOrAdmin =
    myMembership?.role === "owner" || myMembership?.role === "admin";

  return (
    <Container fluid className="p-4">
      <PageHeading heading="Messages" />
      <Row>
        {/* Left sidebar */}
        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6>Channels</h6>
                <Button size="sm" onClick={() => setCreatingChannel(true)}>
                  + New
                </Button>
              </div>
              <ListGroup variant="flush">
                {channels.map((c) => (
                  <ListGroup.Item
                    key={c.id}
                    action
                    active={selectedChannel?.id === c.id}
                    onClick={() => openChannel(c)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>{c.name}</div>
                      {unreads[c.id] && <Badge bg="danger">•</Badge>}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6>Direct Messages</h6>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => openAddDirectMessage()}
                >
                  + New
                </Button>
              </div>
              <ListGroup variant="flush">
                {dmChannels.map((c) => (
                  <ListGroup.Item
                    key={c.id}
                    action
                    active={selectedChannel?.id === c.id}
                    onClick={() => openChannel(c)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>{c.displayName || c.name}</div>
                      {unreads[c.id] && <Badge bg="danger">•</Badge>}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Center: Chat */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body
              style={{
                height: "70vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="d-flex justify-content-between mb-3">
                <strong>{selectedChannel?.name ?? "Select a channel"}</strong>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px",
                  border: "1px solid #eee",
                  borderRadius: 6,
                }}
              >
                {loadingMessages ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <Spinner />
                  </div>
                ) : selectedChannel ? (
                  <>
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`mb-2 ${
                          m.senderId === currentUser.id ? "text-end" : ""
                        }`}
                      >
                        <div
                          style={{ display: "inline-block", maxWidth: "80%" }}
                        >
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {senderName(m)} ·{" "}
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              background:
                                m.senderId === currentUser.id
                                  ? "#e7f3ff"
                                  : "#f5f5f5",
                            }}
                          >
                            {m.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef}></div>
                  </>
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                    Select a channel to view messages
                  </div>
                )}
              </div>

              <div className="mt-3">
                <InputGroup>
                  <Form.Control
                    placeholder={
                      selectedChannel
                        ? "Type a message and press Enter..."
                        : "Select a channel first"
                    }
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!selectedChannel}
                  />
                  <Button
                    variant="primary"
                    onClick={sendMessage}
                    disabled={!selectedChannel || !msgInput.trim()}
                  >
                    Send
                  </Button>
                </InputGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right sidebar: Members */}
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6>Members</h6>
                {isOwnerOrAdmin && selectedChannel && (
                  <Button
                    size="sm"
                    variant="outline-success"
                    onClick={openAddMemberModal}
                  >
                    + Add
                  </Button>
                )}
              </div>
              {selectedChannel ? (
                <ListGroup variant="flush">
                  {members.map((m) => (
                    <ListGroup.Item key={m.id}>
                      {m.firstName} {m.lastName}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-muted text-center">
                  No channel selected
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Channel Modal */}
      <Modal
        show={creatingChannel}
        onHide={() => setCreatingChannel(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Channel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Channel Name</Form.Label>
            <Form.Control
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="e.g. sales-team"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCreatingChannel(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateChannel}
            disabled={!newChannelName.trim()}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Member Modal */}
      <Modal show={addingMember} onHide={() => setAddingMember(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {availableUsers.map((u) => (
              <ListGroup.Item
                key={u.id}
                action
                onClick={() => addMember(u.id)}
                disabled={members.some((m) => m.id === u.id)}
              >
                {u.firstName} {u.lastName}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      {/* Direct Message Modal */}
      <Modal show={showDMModal} onHide={() => setShowDMModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Direct Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={selectedUserForDM ?? ""}
            onChange={(e) => setSelectedUserForDM(Number(e.target.value))}
          >
            <option value="">Select a user...</option>
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDMModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={createDM}
            disabled={!selectedUserForDM}
          >
            Start Chat
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
