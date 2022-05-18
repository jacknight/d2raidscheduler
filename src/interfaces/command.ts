import { APIMessage } from "discord-api-types/v10";
import {
  ButtonInteraction,
  Client,
  CommandInteraction,
  Message,
} from "discord.js";

export interface CommandInterface {
  data: any;
  run: (interaction: CommandInteraction) => Promise<any>;
  handleButton?: (interaction: ButtonInteraction) => Promise<any>;
}
