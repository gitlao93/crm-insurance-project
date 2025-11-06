import { useCallback, useEffect, useState } from "react";
import { channelMembersService } from "../../../services/channelServices";
import type { ChannelMemberResponse } from "../../../services/channelServices";

export function useChannelMembers(channelId: number | null) {
  const [members, setMembers] = useState<ChannelMemberResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!channelId) return;
    try {
      setLoading(true);
      const data = await channelMembersService.findAll(channelId);
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch channel members:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    fetchMembers,
    setMembers,
  };
}
