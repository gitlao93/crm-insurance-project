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
import { useCallback, useEffect, useState } from "react";
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

  // 🆕 state for create channel modal
  const [createChannelName, setCreateChannelName] = useState("");
  const [creatingChannel, setCreatingChannel] = useState(false);

  // 🆕 state for add member modal
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [memberRole, setMemberRole] = useState<"member" | "admin">("member");

  const fetchChannel = useCallback(async () => {
    try {
      setLoadingChannels(true);
      const agencyId = userObj?.agencyId;
      const userId = userObj?.id;
      if (!agencyId) throw new Error("No agency info");
      if (!userId) throw new Error("No user info");

      const response = await channelService.findAll(userId, agencyId);
      setChannels(response);
      // refresh activeChat members if updated
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

      await fetchChannel(); // refresh list
      handleCloseCreateModal(); // close modal
    } catch (err) {
      console.error("Failed to create channel", err);
    } finally {
      setCreatingChannel(false);
    }
  };

  // 🆕 submit add member
  const handleSubmitAddMember = async () => {
    if (!selectedUserId || activeChat.type !== "channel") return;
    try {
      setAddingMember(true);

      await channelMembersService.add(activeChat.id, {
        userId: selectedUserId,
        role: memberRole,
      });

      await fetchChannel(); // refresh members
      setOpenAddMemberModal(false);
      setSelectedUserId(null);
    } catch (err) {
      console.error("Failed to add member", err);
    } finally {
      setAddingMember(false);
    }
  };

  const handleDeleteChannel = async (channelId: number) => {
    if (!window.confirm("Are you sure you want to delete this channel?"))
      return;
    try {
      await channelService.remove(channelId); // assumes channelService.remove exists
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
      await channelMembersService.remove(channelId, userId); // assumes remove exists
      await fetchChannel();
    } catch (err) {
      console.error("Failed to delete member", err);
    }
  };

  const [messages, setMessages] = useState<MessageResponseDto[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (activeChat.type === "channel" && activeChat.id) {
      try {
        setLoadingMessages(true);
        const response = await messageService.findAllByChannel(activeChat.id);
        setMessages(response);
      } catch (err) {
        console.error("Failed to load messages", err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    }
  }, [activeChat.id, activeChat.type, setMessages]);

  useEffect(() => {
    if (activeChat.type === "channel" && activeChat.id) {
      fetchMessages();
    } else {
      setMessages([]); // clear messages for user chat
    }
  }, [activeChat, fetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || activeChat.type !== "channel") return;

    try {
      const payload = {
        channelId: activeChat.id,
        senderId: userObj.id,
        content: newMessage,
      };
      await messageService.create(activeChat.id, payload);

      setNewMessage("");
      await fetchMessages();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

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
                            ? "#d8d8d8ff" // light blue
                            : "transparent",
                        borderColor:
                          activeChat.type === "channel" &&
                          activeChat.id === channel.id
                            ? "#d8d8d8ff" // Bootstrap primary text color
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
                              e.stopPropagation(); // prevent selecting channel when clicking delete
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

          <Col md={9} className="d-flex flex-column">
            {/* Header */}
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

            <Row className="flex-grow-1 overflow-hidden">
              {/* Messages */}
              <Col md={9} className="d-flex flex-column">
                <div className="flex-grow-1 p-3 overflow-auto">
                  {loadingMessages ? (
                    <div className="text-muted">Loading messages...</div>
                  ) : messages.length > 0 ? (
                    messages.map((msg) => {
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
                    })
                  ) : activeChat.id === 0 ? (
                    <div className="text-muted">No Channel/ User Selected</div>
                  ) : (
                    <div className="text-muted">No messages yet</div>
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

      {/* 🆕 Add Member Modal */}
      <Modal
        show={openAddMemberModal}
        onHide={() => setOpenAddMemberModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Member to {activeChat.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select User</Form.Label>
              <Form.Select
                value={selectedUserId ?? ""}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
              >
                <option value="">-- Select a user --</option>
                {users
                  .filter(
                    (u) => !activeChat.members?.some((m) => m.user.id === u.id) // exclude existing
                  )
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            {/* ✅ Role selection dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={memberRole}
                onChange={(e) =>
                  setMemberRole(e.target.value as "member" | "admin")
                }
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
            disabled={addingMember || !selectedUserId}
          >
            {addingMember ? "Adding..." : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
