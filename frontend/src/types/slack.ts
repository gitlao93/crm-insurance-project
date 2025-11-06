// src/types/slack.ts
export interface Channel {
  id: number;
  name: string;
  displayName?: string;
  type: "public" | "private";
  isDirect: boolean;
  agencyId: number;
  createdAt?: string;
  updatedAt?: string;
  members?: ChannelMember[];
}

export interface ChannelMember {
  id: number;
  channelId: number;
  userId: number;
  role: "owner" | "admin" | "member";
  user?: Partial<User>;
  joinedAt?: string;
}

export interface Message {
  id: number;
  channelId: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender?: Partial<User>;
  channel?: Partial<Channel>;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  agencyId?: number;
}
