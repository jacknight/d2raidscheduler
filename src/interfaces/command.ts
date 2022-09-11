import { ButtonInteraction, CommandInteraction } from "discord.js";

export interface CommandInterface {
  data: any;
  run: (interaction: CommandInteraction) => Promise<any>;
  handleButton?: (interaction: ButtonInteraction) => Promise<any>;
}
