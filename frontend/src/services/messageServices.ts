import api from "./api";
import type { ChannelResponseDto, UserResponseDto } from "./channelServices";

// --- DTOs from your backend ---
export interface CreateMessageDto {
  channelId: number;
  senderId: number;
  content: string;
}

export interface UpdateMessageDto {
  content?: string;
}

export interface MessageStatusResponseDto {
  id: number;
  messageId: number;
  userId: number;
  status: "sent" | "delivered" | "read";
  updatedAt: string;
}

export interface MessageResponseDto {
  id: number;
  content: string;
  sender: UserResponseDto;
  channel: ChannelResponseDto;
  statuses: MessageStatusResponseDto[];
  createdAt: string;
  updatedAt: string;
}

const BASE_URL = "/channels";

export const messageService = {
  async create(
    channelId: number,
    dto: CreateMessageDto
  ): Promise<MessageResponseDto> {
    const { data } = await api.post<MessageResponseDto>(
      `${BASE_URL}/${channelId}/messages`,
      dto
    );
    return data;
  },

  async findAllByChannel(channelId: number): Promise<MessageResponseDto[]> {
    const { data } = await api.get<MessageResponseDto[]>(
      `${BASE_URL}/${channelId}/messages`
    );
    return data;
  },

  async findOne(id: number): Promise<MessageResponseDto> {
    const { data } = await api.get<MessageResponseDto>(`${BASE_URL}/${id}`);
    return data;
  },

  async update(id: number, dto: UpdateMessageDto): Promise<MessageResponseDto> {
    const { data } = await api.patch<MessageResponseDto>(
      `${BASE_URL}/${id}`,
      dto
    );
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
