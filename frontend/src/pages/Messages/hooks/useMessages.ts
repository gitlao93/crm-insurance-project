import { useCallback, useEffect, useState } from "react";

import type { ActiveChat } from "../types";
import {
  messageService,
  type MessageResponseDto,
} from "../../../services/messageServices";
import {
  directMessageService,
  type DirectMessageResponseDto,
} from "../../../services/directMessageService";
import {
  connectSocket,
  disconnectSocket,
} from "../../../services/socketService";
import { useChannels } from "./useChannels";

interface UseMessagesReturn {
  data: (MessageResponseDto | DirectMessageResponseDto)[];
  loading: boolean;
  sendMessage: (message: string) => Promise<void>;
}

export const useMessages = (
  userObj: { id: number; agencyId: number },
  activeChat: ActiveChat
): UseMessagesReturn => {
  const [data, setData] = useState<
    (MessageResponseDto | DirectMessageResponseDto)[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { markUnread } = useChannels(userObj);

  const fetchMessages = useCallback(async () => {
    if (!activeChat.id) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      if (activeChat.type === "channel") {
        const msgs = await messageService.findAllByChannel(activeChat.id);
        setData(msgs);
      } else if (activeChat.type === "user") {
        const msgs = await directMessageService.getConversation(
          userObj.id,
          activeChat.id
        );
        setData(msgs);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeChat.id, activeChat.type, userObj.id]);

  // Fetch messages when chat changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Send message
  const sendMessage = async (message: string) => {
    if (!message.trim() || !activeChat.id) return;

    try {
      let response: MessageResponseDto | DirectMessageResponseDto | undefined;
      if (activeChat.type === "channel") {
        const payload = {
          channelId: activeChat.id,
          senderId: userObj.id,
          content: message,
        };
        response = await messageService.create(activeChat.id, payload);
      } else if (activeChat.type === "user") {
        const payload = {
          senderId: userObj.id,
          receiverId: activeChat.id,
          content: message,
        };
        response = await directMessageService.create(payload);
      }

      if (response) {
        const socket = connectSocket();
        socket.emit("sendMessage", response);
        socket.emit("notification", response);

        setData((prev) => [...prev, response]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Real-time socket updates
  useEffect(() => {
    const socket = connectSocket();

    if (activeChat.id) {
      if (activeChat.type === "channel") {
        socket.emit("joinChannel", {
          channelId: activeChat.id + activeChat.name,
        });
      } else if (activeChat.type === "user") {
        const roomName = [userObj.id, activeChat.id].sort().join("-");
        socket.emit("joinDM", { roomName });
      }
    }

    socket.on("newMessage", (msg) => {
      console.log("Received new message via socket:", msg);
      const isActiveChannel =
        activeChat.type === "channel" && msg.channel?.id === activeChat.id;

      const isActiveDM =
        activeChat.type === "user" &&
        ((msg.sender?.id === userObj.id &&
          msg.receiver?.id === activeChat.id) ||
          (msg.sender?.id === activeChat.id &&
            msg.receiver?.id === userObj.id));

      if (isActiveChannel || isActiveDM) {
        // Message belongs to currently open chat → append
        setData((prev) => [...prev, msg]);
      } else if (msg.channel?.id) {
        // 👇 Message came from another channel → mark that channel as having unread messages
        markUnread(msg.channel.id);
      }
    });

    return () => {
      if (activeChat.id) {
        if (activeChat.type === "channel") {
          socket.emit("leaveChannel", {
            channelId: activeChat.id + activeChat.name,
          });
        } else if (activeChat.type === "user") {
          const roomName = [userObj.id, activeChat.id].sort().join("-");
          socket.emit("leaveDM", { roomName });
        }
      }
      disconnectSocket();
    };
  }, [activeChat, userObj.id]);

  return { data, loading, sendMessage };
};
