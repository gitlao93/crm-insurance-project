// src/services/slackService.ts
import type { Channel, Message } from "../types/slack";
import api from "./api";

export const slackService = {
  async listChannels(): Promise<Channel[]> {
    const res = await api.get("/slack/channels");
    return res.data;
  },

  async createChannel(payload: {
    name: string;
    type?: "public" | "private";
    isDirect?: boolean;
  }) {
    const res = await api.post("/slack/channels", payload);
    return res.data;
  },

  async addMember(channelId: number, userId: number) {
    const res = await api.post(`/slack/channels/${channelId}/members`, {
      userId,
    });
    return res.data;
  },

  async removeMember(channelId: number, userId: number) {
    const res = await api.delete(
      `/slack/channels/${channelId}/members/${userId}`
    );
    return res.data;
  },

  async listMessages(
    channelId: number,
    limit = 50,
    before?: string
  ): Promise<Message[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = { limit };
    if (before) params.before = before;
    const res = await api.get(`/slack/channels/${channelId}/messages`, {
      params,
    });
    return res.data;
  },

  async sendMessage(channelId: number, content: string) {
    const res = await api.post("/slack/messages", { channelId, content });
    return res.data;
  },

  async createOrGetDM(withUserId: number) {
    const res = await api.post("/slack/direct", { withUserId });
    return res.data;
  },
};

export default slackService;
