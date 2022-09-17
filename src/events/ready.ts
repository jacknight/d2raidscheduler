import { ApplicationCommand, Client, Guild } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import commandList from "../commands/_commands";
import RaidModel from "../db/models/RaidModel";
import DungeonModel from "../db/models/DungeonModel";
import { scheduleEventTimeouts } from "../lib/util";

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

  await Promise.all(promises);

  console.log(
    "Global and guild commands deleted. Registering most recent version."
  );

  await client.guilds.fetch();
  await Promise.all(
    client.guilds.cache.map(async (guild) => {
      await Promise.all([
        guild.scheduledEvents.fetch(),
        guild.members.fetch(),
        guild.channels.fetch(),
      ]);
    })
  );
  await rest.put(Routes.applicationCommands(client.application!.id), {
    body: commandData,
  });
  console.log("Commands registered.");

  console.log("Setting up timeouts for existing raids and dungeons.");
  await Promise.all(
    client.guilds.cache.map(async (guild) => {
      // Look up each raid + dungeon for guild ID
      const raids = await RaidModel.find({
        guildId: guild.id,
        date: { $gt: Date.now() },
      });
      const dungeons = await DungeonModel.find({
        guildId: guild.id,
        date: { $gt: Date.now() },
      });

      const promises: Promise<void>[] = [];
      raids.forEach((raid) =>
        promises.push(scheduleEventTimeouts(raid.id, "raid"))
      );
      dungeons.forEach((dungeon) =>
        promises.push(scheduleEventTimeouts(dungeon.id, "dungeon"))
      );
      await Promise.all(promises);
      console.log(
        `Created ${promises.length} timeouts for raids and dungeons.`
      );
    })
  );
  console.log("Bot ready.");
};

export default onReady;
