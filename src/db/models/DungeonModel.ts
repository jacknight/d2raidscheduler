import { model, Schema } from "mongoose";

export interface DungeonModelInterface {
  id: string;
  date: Date;
  zone: string;
  dungeon: number;
  players: {
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
  scheduledEventId: string;
}

export const DungeonSchema = new Schema({
  id: String,
  date: Date,
  zone: String,
  dungeon: Number,
  players: {
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
  scheduledEventId: String,
});

export default model<DungeonModelInterface>("dungeon", DungeonSchema);
