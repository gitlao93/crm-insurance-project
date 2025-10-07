import api from "./api";

// --- DTOs from your backend ---
export interface CreateDirectMessageDto {
  senderId: number;
  receiverId: number;
  content: string;
}

export interface DirectMessageResponseDto {
  id: number;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  receiver: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

const BASE_URL = "/direct-messages";

export const directMessageService = {
  /**
   * Create a new direct message (DM)
   */
  async create(dto: CreateDirectMessageDto): Promise<DirectMessageResponseDto> {
    const { data } = await api.post<DirectMessageResponseDto>(BASE_URL, dto);
    return data;
  },

  /**
   * Fetch the full conversation between two users
   */
  async getConversation(
    userId1: number,
    userId2: number
  ): Promise<DirectMessageResponseDto[]> {
    const { data } = await api.get<DirectMessageResponseDto[]>(
      `${BASE_URL}/${userId1}/${userId2}`
    );
    return data;
  },

  /**
   * Mark a message as read
   */
  async markAsRead(
    messageId: number,
    userId: number
  ): Promise<DirectMessageResponseDto> {
    const { data } = await api.post<DirectMessageResponseDto>(
      `${BASE_URL}/${messageId}/read`,
      { userId }
    );
    return data;
  },
};
