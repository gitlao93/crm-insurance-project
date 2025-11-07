import { useCallback, useEffect, useState } from "react";
import {
  channelMembersService,
  channelService,
  type ChannelResponseDto,
} from "../../../services/channelServices";

export interface UseChannelsReturn {
  data: ChannelResponseDto[];
  loading: boolean;
  openCreateModal: boolean;
  openAddMemberModal: boolean;
  createChannelName: string;
  markUnread: (channelId: number) => void;
  setCreateChannelName: (name: string) => void;
  openCreateChannelModal: () => void;
  closeCreateChannelModal: () => void;
  openAddMemberModalHandler: () => void;
  closeAddMemberModalHandler: () => void;
  fetchChannels: () => Promise<void>;
  createChannel: () => Promise<void>;
  deleteChannel: (channelId: number) => Promise<void>;
  deleteMember: (channelId: number, userId: number) => Promise<void>;
  addMember: (
    channelId: number,
    userId: number,
    role: "member" | "admin"
  ) => Promise<void>; // ✅ NEW
}

export const useChannels = (
  userObj: { id: number; agencyId: number } | null
): UseChannelsReturn => {
  const [data, setData] = useState<ChannelResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [createChannelName, setCreateChannelName] = useState("");

  const fetchChannels = useCallback(async () => {
    if (!userObj?.id || !userObj?.agencyId) return;
    try {
      setLoading(true);
      const result = await channelService.findAll(userObj.id, userObj.agencyId);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userObj]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const createChannel = useCallback(async () => {
    if (!createChannelName.trim() || !userObj) return;
    try {
      const payload = {
        name: createChannelName.trim(),
        agencyId: userObj.agencyId,
        createdById: userObj.id,
      };
      await channelService.create(payload);
      await fetchChannels();
      setCreateChannelName("");
      setOpenCreateModal(false);
    } catch (err) {
      console.error("Failed to create channel:", err);
    }
  }, [createChannelName, userObj, fetchChannels]);

  const deleteChannel = async (channelId: number) => {
    if (!window.confirm("Delete this channel?")) return;
    try {
      await channelService.remove(channelId);
      await fetchChannels();
    } catch (err) {
      console.error("Failed to delete channel:", err);
    }
  };

  const deleteMember = async (channelId: number, userId: number) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await channelMembersService.remove(channelId, userId);
      await fetchChannels();
    } catch (err) {
      console.error("Failed to delete member:", err);
    }
  };

  const addMember = async (
    channelId: number,
    userId: number,
    role: "member" | "admin"
  ) => {
    if (!channelId || !userId) return;
    try {
      setLoading(true);
      await channelMembersService.add(channelId, { userId, role });
      await fetchChannels();
      setOpenAddMemberModal(false);
    } catch (err) {
      console.error("Failed to add member", err);
    } finally {
      setLoading(false);
    }
  };

  const markUnread = useCallback((channelId: number) => {
    setData((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, hasUnread: true } : c))
    );
  }, []);

  return {
    data,
    loading,
    openCreateModal,
    openAddMemberModal,
    createChannelName,
    markUnread,
    setCreateChannelName,
    openCreateChannelModal: () => setOpenCreateModal(true),
    closeCreateChannelModal: () => setOpenCreateModal(false),
    openAddMemberModalHandler: () => setOpenAddMemberModal(true),
    closeAddMemberModalHandler: () => setOpenAddMemberModal(false),
    fetchChannels,
    createChannel,
    deleteChannel,
    deleteMember,
    addMember,
  };
};
