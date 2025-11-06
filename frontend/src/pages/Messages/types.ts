import type { ChannelMemberResponse } from "../../services/channelServices";

export interface ActiveChat {
  type: "channel" | "user";
  id: number;
  name: string;
  members?: ChannelMemberResponse[];
}
