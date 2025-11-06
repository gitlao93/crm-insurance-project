import api from "./api";

/** -------------------------------
 * 🧾 INTERFACES
 * ------------------------------- */
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message?: string | null;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface CreateNotificationRequest {
  title: string;
  message?: string;
}

/** -------------------------------
 * ⚙️ SERVICE METHODS
 * ------------------------------- */
export const notificationService = {
  /** ✅ Create a new notification for a user */
  async createNotification(
    userId: number,
    payload: CreateNotificationRequest
  ): Promise<Notification> {
    const { data } = await api.post<Notification>(
      `/notifications/${userId}`,
      payload
    );
    return data;
  },

  /** ✅ Get all notifications for a user */
  async getNotifications(userId: number): Promise<Notification[]> {
    const { data } = await api.get<Notification[]>(`/notifications/${userId}`);
    return data;
  },

  /** ✅ Mark a single notification as read/unread */
  async markAsRead(notificationId: number): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  /** ✅ Mark all notifications as read for a user */
  async markAllAsRead(userId: number): Promise<{ success: boolean }> {
    const { data } = await api.patch<{ success: boolean }>(
      `/notifications/${userId}/read-all`
    );
    return data;
  },

  /** ✅ Delete a specific notification */
  async deleteNotification(
    userId: number,
    notificationId: number
  ): Promise<{ success: boolean }> {
    const { data } = await api.delete<{ success: boolean }>(
      `/notifications/${userId}/${notificationId}`
    );
    return data;
  },
};
