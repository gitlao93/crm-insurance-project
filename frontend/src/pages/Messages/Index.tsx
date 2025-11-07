import { useEffect, useMemo, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import PageHeading from "../../widgets/PageHeading";
import type { ActiveChat } from "./types";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import MemberList from "./MemberList";
import { useChannels } from "./hooks/useChannels";
import { useUsers } from "./hooks/useUsers";
import { useMessages } from "./hooks/useMessages";
import CreateChannelModal from "./modal/CreateChannelModal";
import AddMemberModal from "./modal/AddMemberModal";
import { useChannelMembers } from "./hooks/useChannelMembers";

export default function Messages() {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = useMemo(() => JSON.parse(storedUser), []);

  const [activeChat, setActiveChat] = useState<ActiveChat>({
    type: "channel",
    id: 0,
    name: "",
    members: [],
  });

  const channels = useChannels(userObj);
  const users = useUsers(userObj);
  const messages = useMessages(userObj, activeChat);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [memberRole, setMemberRole] = useState<"member" | "admin">("member");

  const members = useChannelMembers(
    activeChat.type === "channel" ? activeChat.id : null
  );

  useEffect(() => {
    if (activeChat.type === "channel") {
      const updated = channels.data.find((c) => c.id === activeChat.id);

      if (
        updated &&
        JSON.stringify(updated.members) !== JSON.stringify(activeChat.members)
      ) {
        setActiveChat({
          type: "channel",
          id: updated.id,
          name: updated.name,
          members: updated.members,
        });
      }
    }
  }, [
    activeChat,
    activeChat.id,
    activeChat.members,
    activeChat.type,
    channels.data,
  ]);

  return (
    <Container fluid className="p-4">
      <PageHeading heading="Message" />

      <Row style={{ height: "80vh" }}>
        <Col md={3} className="border-end p-3 bg-light">
          <ChatSidebar
            channels={channels.data}
            users={users.data}
            loadingChannels={channels.loading}
            loadingUsers={users.loading}
            activeChat={activeChat}
            onSelectChat={setActiveChat}
            onDeleteChannel={channels.deleteChannel}
            onOpenCreateChannel={channels.openCreateChannelModal}
          />
        </Col>

        <Col md={9} className="d-flex flex-row">
          <Row className="flex-grow-1">
            <Col md={activeChat.type === "channel" ? 9 : 12}>
              <ChatWindow
                user={userObj}
                activeChat={activeChat}
                messages={messages.data}
                loading={messages.loading}
                onSendMessage={messages.sendMessage}
              />
            </Col>
            <Col md={3}>
              {activeChat.type === "channel" && (
                <MemberList
                  members={members.members}
                  onDeleteMember={async (channelId, userId) => {
                    await channels.deleteMember(channelId, userId);
                    await members.fetchMembers(); // refresh member list only
                  }}
                  channelId={activeChat.id}
                  activeChat={activeChat}
                  onAddMember={channels.openAddMemberModalHandler}
                />
              )}
            </Col>
          </Row>
        </Col>
      </Row>

      <CreateChannelModal
        show={channels.openCreateModal}
        channelName={channels.createChannelName}
        onChange={channels.setCreateChannelName}
        onClose={channels.closeCreateChannelModal}
        onSubmit={channels.createChannel}
        loading={channels.loading}
      />

      <AddMemberModal
        show={channels.openAddMemberModal}
        users={users.data}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
        memberRole={memberRole}
        onRoleChange={setMemberRole}
        onClose={() => {
          setSelectedUserId(null);
          setMemberRole("member");
          channels.closeAddMemberModalHandler();
        }}
        onSubmit={async () => {
          if (!selectedUserId || activeChat.type !== "channel") return;
          await channels.addMember(activeChat.id, selectedUserId, memberRole);
          await members.fetchMembers(); // ✅ refresh member list only

          setSelectedUserId(null);
          setMemberRole("member");
        }}
        loading={channels.loading}
      />
    </Container>
  );
}
