import { Interaction } from "discord.js";
import { Document, model, Schema } from "mongoose";
import { Raids } from "../../commands/raid";

export interface RaidModelInterface {
  id: string;
  date: Date;
  zone: string;
  raid: number;
  raiders: {
    yes: string[]; // discord id numbers
    no: string[];
    maybe: string[];
    reserve: string[];
  };
  status: "pending" | "cancelled" | "active" | "completed";
  duration: number;
  guildId: string;
  channelId: string;
  messageId: string;
}

export const RaidSchema = new Schema({
  id: String,
  date: Date,
  zone: String,
  raid: Number,
  raiders: {
    yes: Array, // discord id Numbers
    no: Array,
    maybe: Array,
    reserve: Array,
  },
  status: String,
  duration: Number,
  guildId: String,
  channelId: String,
  messageId: String,
});

export default model<RaidModelInterface>("raid", RaidSchema);
