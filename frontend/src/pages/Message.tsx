import {
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  ListGroup,
  Modal,
  Row,
  Spinner,
  Tab,
} from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
import { useCallback, useEffect, useRef, useState } from "react";
import { userService, type User } from "../services/userService";
import {
  channelMembersService,
  channelService,
  type ChannelMemberResponse,
  type ChannelResponseDto,
} from "../services/channelServices";
import { Trash } from "react-bootstrap-icons";
import {
  messageService,
  type MessageResponseDto,
} from "../services/messageServices";
import {
  directMessageService,
  type DirectMessageResponseDto,
} from "../services/directMessageService";
import { connectSocket, disconnectSocket } from "../services/socketService";

export interface ActiveChat {
  type: "channel" | "user";
  id: number;
  name: string;
  members?: ChannelMemberResponse[];
}

export default function Message() {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);

  const [channels, setChannels] = useState<ChannelResponseDto[] | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);

  const [activeChat, setActiveChat] = useState<ActiveChat>({
    type: "channel",
    name: "",
    id: 0,
    members: [],
  });

  const [newMessage, setNewMessage] = useState("");
  const [openCreateChannelModal, setOpenCreateChannelModal] = useState(false);
  const [createChannelName, setCreateChannelName] = useState("");
  const [creatingChannel, setCreatingChannel] = useState(false);

  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [memberRole, setMemberRole] = useState<"member" | "admin">("member");

  // Load Channels
  const fetchChannel = useCallback(async () => {
    try {
      setLoadingChannels(true);
      const agencyId = userObj?.agencyId;
      const userId = userObj?.id;
      if (!agencyId || !userId) throw new Error("Missing user info");

      const response = await channelService.findAll(userId, agencyId);
      setChannels(response);

      if (activeChat.type === "channel") {
        const updated = response.find((c) => c.id === activeChat.id);
        if (updated) {
          setActiveChat((prev) => ({
            ...prev,
            members: updated.members,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch channels", err);
      setChannels(null);
    } finally {
      setLoadingChannels(false);
    }
  }, [userObj?.agencyId, userObj?.id, activeChat.id, activeChat.type]);

  // Load Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const agencyId = userObj?.agencyId;
      if (!agencyId) throw new Error("No agency info");

      const response = await userService.getUsers(agencyId);
      setUsers(response);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [userObj?.agencyId]);

  useEffect(() => {
    fetchChannel();
    fetchUsers();
  }, [fetchUsers, fetchChannel]);

  // Create Channel
  const handleCloseCreateModal = () => {
    setOpenCreateChannelModal(false);
    setCreateChannelName("");
  };

  const handleSubmitCreateModal = async () => {
    try {
      if (!createChannelName.trim()) return;
      setCreatingChannel(true);

      const payload = {
        name: createChannelName,
        agencyId: userObj.agencyId,
        createdById: userObj.id,
      };

      await channelService.create(payload);
      await fetchChannel();
      handleCloseCreateModal();
    } catch (err) {
      console.error("Failed to create channel", err);
    } finally {
      setCreatingChannel(false);
    }
  };

  // Add Member
  const handleSubmitAddMember = async () => {
    if (!selectedUserId || activeChat.type !== "channel") return;
    try {
      setAddingMember(true);
      await channelMembersService.add(activeChat.id, {
        userId: selectedUserId,
        role: memberRole,
      });

      await fetchChannel();
      setOpenAddMemberModal(false);
      setSelectedUserId(null);
    } catch (err) {
      console.error("Failed to add member", err);
    } finally {
      setAddingMember(false);
    }
  };

  // Delete Channel or Member
  const handleDeleteChannel = async (channelId: number) => {
    if (!window.confirm("Are you sure you want to delete this channel?"))
      return;
    try {
      await channelService.remove(channelId);
      await fetchChannel();
      if (activeChat.type === "channel" && activeChat.id === channelId) {
        setActiveChat({ type: "channel", id: 0, name: "", members: [] });
      }
    } catch (err) {
      console.error("Failed to delete channel", err);
    }
  };

  const handleDeleteMember = async (channelId: number, userId: number) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await channelMembersService.remove(channelId, userId);
      await fetchChannel();
    } catch (err) {
      console.error("Failed to delete member", err);
    }
  };

  // Messages state (shared for both DM + Channels)
  const [messages, setMessages] = useState<
    (MessageResponseDto | DirectMessageResponseDto)[]
  >([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch Messages (both channel + DM)
  const fetchMessages = useCallback(async () => {
    try {
      setLoadingMessages(true);

      if (activeChat.type === "channel" && activeChat.id) {
        const response = await messageService.findAllByChannel(activeChat.id);
        setMessages(response);
      } else if (activeChat.type === "user" && activeChat.id) {
        const response = await directMessageService.getConversation(
          userObj.id,
          activeChat.id
        );
        setMessages(response);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeChat.id, activeChat.type, userObj.id]);

  useEffect(() => {
    if (activeChat.id) fetchMessages();
    else setMessages([]);
  }, [activeChat, fetchMessages]);

  // Send message (works for both DM + Channel)
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      let response;

      if (activeChat.type === "channel") {
        const payload = {
          channelId: activeChat.id,
          senderId: userObj.id,
          content: newMessage,
        };
        response = await messageService.create(activeChat.id, payload);
      } else if (activeChat.type === "user") {
        const payload = {
          senderId: userObj.id,
          receiverId: activeChat.id,
          content: newMessage,
        };
        response = await directMessageService.create(payload);
      } else return;

      const socket = connectSocket();
      socket.emit("sendMessage", response);
      socket.emit("notification", response);

      setMessages((prev) => [...prev, response]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  // Socket handling (works for DM + Channel)
  useEffect(() => {
    const socket = connectSocket();

    if (activeChat.id) {
      if (activeChat.type === "channel") {
        socket.emit("joinChannel", {
          channelId: activeChat.id + activeChat.name,
        });
      } else if (activeChat.type === "user") {
        const roomName = [userObj.id, activeChat.id].sort().join("-");
        socket.emit("joinDM", { roomName });
      }
    }

    socket.on("newMessage", (msg) => {
      if (activeChat.type === "channel" && msg.channel?.id === activeChat.id) {
        setMessages((prev) => [...prev, msg]);
      } else if (
        activeChat.type === "user" &&
        ((msg.sender?.id === userObj.id &&
          msg.receiver?.id === activeChat.id) ||
          (msg.sender?.id === activeChat.id && msg.receiver?.id === userObj.id))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      if (activeChat.id) {
        if (activeChat.type === "channel") {
          socket.emit("leaveChannel", {
            channelId: activeChat.id + activeChat.name,
          });
        } else if (activeChat.type === "user") {
          const roomName = [userObj.id, activeChat.id].sort().join("-");
          socket.emit("leaveDM", { roomName });
        }
      }
      disconnectSocket();
    };
  }, [activeChat.id, activeChat.name, activeChat.type, userObj.id]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Container fluid className="p-6">
      <PageHeading heading="Message" />
      <Tab.Container>
        <Row style={{ height: "75vh" }}>
          {/* Sidebar */}
          <Col md={3} className="border-end p-3 bg-light">
            <Row>
              <Col md={6}>
                <h5>Channels</h5>
              </Col>
              <Col md={6}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="w-100 mb-4"
                  onClick={() => setOpenCreateChannelModal(true)}
                >
                  + Create Channel
                </Button>
              </Col>
            </Row>

            {loadingChannels ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" role="status" />
              </div>
            ) : (
              <ListGroup className="mb-5">
                {channels && channels.length > 0 ? (
                  channels.map((channel) => (
                    <ListGroup.Item
                      key={channel.id}
                      action
                      active={
                        activeChat.type === "channel" &&
                        activeChat.id === channel.id
                      }
                      onClick={() =>
                        setActiveChat({
                          type: "channel",
                          name: channel.name,
                          id: channel.id,
                          members: channel.members,
                        })
                      }
                      style={{
                        backgroundColor:
                          activeChat.type === "channel" &&
                          activeChat.id === channel.id
                            ? "#d8d8d8ff"
                            : "transparent",
                        borderColor:
                          activeChat.type === "channel" &&
                          activeChat.id === channel.id
                            ? "#d8d8d8ff"
                            : "transparent",
                      }}
                    >
                      <Row>
                        <Col md={10}>
                          <h5>{channel.name}</h5>
                        </Col>
                        <Col md={2}>
                          <Trash
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChannel(channel.id);
                            }}
                            size={16}
                            style={{ cursor: "pointer", color: "gray" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "red")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "gray")
                            }
                          />
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))
                ) : (
                  <div className="text-muted text-center py-3">
                    Create your first channel
                  </div>
                )}
              </ListGroup>
            )}

            <h5>Users</h5>
            {loadingUsers ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" role="status" />
              </div>
            ) : (
              <ListGroup>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <ListGroup.Item
                      key={user.id}
                      action
                      active={
                        activeChat.type === "user" && activeChat.id === user.id
                      }
                      onClick={() =>
                        setActiveChat({
                          type: "user",
                          name: user.firstName + " " + user.lastName,
                          id: user.id,
                        })
                      }
                      style={{
                        backgroundColor:
                          activeChat.type === "user" &&
                          activeChat.id === user.id
                            ? "#d8d8d8ff"
                            : "transparent",
                        borderColor:
                          activeChat.type === "user" &&
                          activeChat.id === user.id
                            ? "#d8d8d8ff"
                            : "transparent",
                      }}
                    >
                      <h5>
                        {user.firstName} {user.lastName}
                      </h5>
                      <h6>{user.role}</h6>
                    </ListGroup.Item>
                  ))
                ) : (
                  <div className="text-muted text-center py-3">
                    No users found
                  </div>
                )}
              </ListGroup>
            )}
          </Col>

          {/* Chat Area */}
          <Col md={9} className="d-flex flex-column overflow-auto">
            <div className="border-bottom p-2 fw-bold d-flex justify-content-between align-items-center">
              <span>{activeChat.name}</span>
              {activeChat.type === "channel" && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setOpenAddMemberModal(true)}
                >
                  + Add Member
                </Button>
              )}
            </div>

            <Row className="flex-grow-1">
              {/* Messages */}
              <Col md={9} className="d-flex flex-column">
                <div
                  ref={containerRef}
                  className="flex-grow-1 p-3 overflow-y-scroll"
                  style={{ maxHeight: "70vh" }}
                >
                  {loadingMessages ? (
                    <div className="text-muted">Loading messages...</div>
                  ) : messages.length > 0 ? (
                    <>
                      {messages.map((msg) => {
                        const isMine = msg.sender.id === userObj.id;
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
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  ) : activeChat.id === 0 ? (
                    <div
                      className="text-muted d-flex justify-content-center align-items-center"
                      style={{ height: "50vh" }}
                    >
                      Select a Chat
                    </div>
                  ) : (
                    <div
                      className="text-muted d-flex justify-content-center align-items-center"
                      style={{ height: "50vh" }}
                    >
                      No messages yet
                    </div>
                  )}
                </div>

                {/* Message Input */}
                {activeChat.id != 0 && (
                  <div className="p-2 border-top">
                    <InputGroup>
                      <Form.Control
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                      />
                      <Button variant="primary" onClick={handleSendMessage}>
                        Send
                      </Button>
                    </InputGroup>
                  </div>
                )}
              </Col>

              {/* Members list */}
              {activeChat.type === "channel" && (
                <Col
                  md={3}
                  className="border-start p-3 d-flex flex-column"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  <h6 className="mb-3">Members</h6>
                  <ListGroup
                    variant="flush"
                    className="flex-grow-1 overflow-auto"
                  >
                    {activeChat.members &&
                      activeChat.members.map((member, idx) => (
                        <ListGroup.Item
                          key={idx}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <span>
                            {member.user.firstName} {member.user.lastName} (
                            {member.role})
                          </span>
                          <Trash
                            onClick={() =>
                              handleDeleteMember(activeChat.id, member.id)
                            }
                            size={16}
                            style={{ cursor: "pointer", color: "gray" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "red")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "gray")
                            }
                          />
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </Tab.Container>

      {/* Create Channel Modal */}
      <Modal
        show={openCreateChannelModal}
        onHide={handleCloseCreateModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Channel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Channel Name</Form.Label>
              <Form.Control
                type="text"
                value={createChannelName}
                onChange={(e) => setCreateChannelName(e.target.value)}
                placeholder="Enter channel name"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitCreateModal}
            disabled={creatingChannel}
          >
            {creatingChannel ? "Creating..." : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        show={openAddMemberModal}
        onHide={() => setOpenAddMemberModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select User</Form.Label>
              <Form.Select
                value={selectedUserId ?? ""}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
              >
                <option value="">Select user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={memberRole}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e) => setMemberRole(e.target.value as any)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setOpenAddMemberModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitAddMember}
            disabled={addingMember}
          >
            {addingMember ? "Adding..." : "Add Member"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
