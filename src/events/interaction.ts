import { Interaction } from "discord.js";
import commandList from "../commands/_commands";

const onInteraction = (interaction: Interaction) => {
  if (interaction.isCommand()) {
    for (const command of commandList) {
      if (command.data.name === interaction.commandName) {
        command.run(interaction);
        break;
      }
    }
  } else if (interaction.isButton()) {
    for (const command of commandList) {
      if (command.data.name === interaction.customId.split("-")[0]) {
        command.handleButton
          ? command.handleButton(interaction)
          : console.error(
              "Handle button not defined for button interaction: ",
              interaction
            );
        break;
      }
    }
  }
};

export default onInteraction;
