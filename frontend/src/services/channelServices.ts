// === Interfaces matching backend DTOs ===

import api from "./api";

// Request DTOs
export interface CreateChannelDto {
  name: string;
  agencyId: number;
  createdById?: number;
}

export interface UpdateChannelDto {
  name?: string;
  isPrivate?: boolean;
  isArchived?: boolean;
}

// Response DTOs
export interface UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ChannelResponseDto {
  id: number;
  name: string;
  isPrivate: boolean;
  isArchived: boolean;
  agencyId: number;
  createdBy: UserResponseDto;
  createdAt: string;
  members: ChannelMemberResponse[];
  updatedAt: string;
}

export type ChannelRole = "owner" | "admin" | "member";

export interface ChannelMemberResponse {
  id: number;
  user: UserResponseDto;
  role: ChannelRole;
  joinedAt: string;
}

export interface AddChannelMemberDto {
  channelId: number;
  userId: number;
  role: ChannelRole;
}

export interface UpdateChannelMemberDto {
  role: ChannelRole;
}

// === Service functions ===
export const channelService = {
  async create(dto: CreateChannelDto): Promise<ChannelResponseDto> {
    const { data } = await api.post<ChannelResponseDto>("/channels", dto);
    return data;
  },

  async findAll(
    userId: number,
    agencyId: number
  ): Promise<ChannelResponseDto[]> {
    const { data } = await api.get<ChannelResponseDto[]>(
      `/channels?userId=${userId}&agencyId=${agencyId}`
    );
    return data;
  },

  async findOne(id: number): Promise<ChannelResponseDto> {
    const { data } = await api.get<ChannelResponseDto>(`/channels/${id}`);
    return data;
  },

  async update(id: number, dto: UpdateChannelDto): Promise<ChannelResponseDto> {
    const { data } = await api.patch<ChannelResponseDto>(
      `/channels/${id}`,
      dto
    );
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/channels/${id}`);
  },
};

const API_BASE = "/channels"; // base path matches your NestJS controller

export const channelMembersService = {
  async add(channelId: number, dto: Omit<AddChannelMemberDto, "channelId">) {
    const { data } = await api.post<ChannelMemberResponse>(
      `${API_BASE}/${channelId}/members`,
      { ...dto, channelId }
    );
    return data;
  },

  async findAll(channelId: number) {
    const { data } = await api.get<ChannelMemberResponse[]>(
      `${API_BASE}/${channelId}/members`
    );
    return data;
  },

  async findOne(channelId: number, id: number) {
    const { data } = await api.get<ChannelMemberResponse>(
      `${API_BASE}/${channelId}/members/${id}`
    );
    return data;
  },

  async update(channelId: number, id: number, dto: UpdateChannelMemberDto) {
    const { data } = await api.patch<ChannelMemberResponse>(
      `${API_BASE}/${channelId}/members/${id}`,
      dto
    );
    return data;
  },

  async remove(channelId: number, id: number) {
    await api.delete(`${API_BASE}/${channelId}/members/${id}`);
  },
};
