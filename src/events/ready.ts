import { ApplicationCommand, Client, Guild } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import commandList from "../commands/_commands";

const onReady = async (client: Client) => {
  const rest = new REST().setToken(process.env.DISCORD_AUTH_TOKEN!);

  const commandData = commandList.map((command) => command.data.toJSON());

  const promises: Promise<ApplicationCommand>[] = [];
  client.application?.commands.cache.forEach((command) => {
    promises.push(command.delete());
  });
  client.guilds.cache.forEach((guild) => {
    guild.commands.cache.forEach((command) => {
      promises.push(command.delete());
    });
  });

  Promise.all(promises);

  console.log(
    "Global and guild commands deleted. Registering most recent version."
  );
  await rest.put(Routes.applicationCommands(client.application!.id), {
    body: commandData,
  });

  console.log("Commands registered. Bot is ready.");
};

export default onReady;
