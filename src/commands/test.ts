import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandInterface } from "../interfaces/command";

const testCommand: CommandInterface = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Testing slash commands for the first time"),

  run: async (interaction: CommandInteraction) => {
    return console.log(interaction);
  },
};

export default testCommand;
