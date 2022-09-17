import { MessageEmbed } from "discord.js";
import { Dungeons } from "../commands/dungeon";
import { Raids } from "../commands/raid";
import { DungeonModelInterface } from "../db/models/DungeonModel";
import { RaidModelInterface } from "../db/models/RaidModel";
import client from "./client";

export const createRaidEmbed = (raidData: RaidModelInterface): MessageEmbed => {
  const guardiansNeeded = Math.max(
    0,
    6 - raidData.raiders.yes.length - raidData.raiders.reserve.length
  ).toString();

  const embed = new MessageEmbed()
    .setTitle(`${Raids[raidData.raid]} Raid`)
    .setColor(0xffffff)
    .addFields(
      {
        name: "Date",
        value: raidData.date.toLocaleString("en-us", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: raidData.zone,
          timeZoneName: "short",
        }),
        inline: true,
      },
      {
        name: "Guardians Needed",
        value: guardiansNeeded,
        inline: false,
      }
    )
    .addFields(
      {
        inline: true,
        name: "Confirmed",
        value: `${
          raidData.raiders.yes.length > 0
            ? raidData.raiders.yes.reduce((acc, raiderId) => {
                const guild = client.guilds.cache.get(raidData.guildId);
                const user = guild?.members.cache.get(raiderId)?.user;
                return `${acc}\n${user?.toString()}`;
              }, "")
            : "None"
        }`,
      },
      {
        inline: true,
        name: "Reserves",
        value: `${
          raidData.raiders.reserve.length > 0
            ? raidData.raiders.reserve.reduce((acc, raiderId) => {
                const guild = client.guilds.cache.get(raidData.guildId);
                const user = guild?.members.cache.get(raiderId)?.user;
                return `${acc}\n${user?.toString()}`;
              }, "")
            : "None"
        }`,
      },
      {
        inline: true,
        name: "Maybes",
        value: `${
          raidData.raiders.maybe.length > 0
            ? raidData.raiders.maybe.reduce((acc, raiderId) => {
                const guild = client.guilds.cache.get(raidData.guildId);
                const user = guild?.members.cache.get(raiderId)?.user;
                return `${acc}\n${user?.toString()}`;
              }, "")
            : "None"
        }`,
      }
    );

  return embed;
};

export const createDungeonEmbed = (
  dungeonData: DungeonModelInterface
): MessageEmbed => {
  const guardiansNeeded = Math.max(
    0,
    6 - dungeonData.players.yes.length - dungeonData.players.reserve.length
  ).toString();

  const embed = new MessageEmbed()
    .setTitle(`${Dungeons[dungeonData.dungeon]} Run`)
    .setColor(0xff0000)
    .addFields(
      {
        name: "Date",
        value: dungeonData.date.toLocaleString("en-us", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: dungeonData.zone,
          timeZoneName: "short",
        }),
        inline: true,
      },
      {
        name: "Guardians Needed",
        value: guardiansNeeded,
        inline: false,
      }
    )
    .addFields(
      {
        inline: true,
        name: "Confirmed",
        value: `${
          dungeonData.players.yes.length > 0
            ? dungeonData.players.yes.reduce((acc, raiderId) => {
                const guild = client.guilds.cache.get(dungeonData.guildId);
                const user = guild?.members.cache.get(raiderId)?.user;
                return `${acc}\n${user?.toString()}`;
              }, "")
            : "None"
        }`,
      },
      {
        inline: true,
        name: "Reserves",
        value: `${
          dungeonData.players.reserve.length > 0
            ? dungeonData.players.reserve.reduce((acc, raiderId) => {
                const guild = client.guilds.cache.get(dungeonData.guildId);
                const user = guild?.members.cache.get(raiderId)?.user;
                return `${acc}\n${user?.toString()}`;
              }, "")
            : "None"
        }`,
      },
      {
        inline: true,
        name: "Maybes",
        value: `${
          dungeonData.players.maybe.length > 0
            ? dungeonData.players.maybe.reduce((acc, raiderId) => {
                const guild = client.guilds.cache.get(dungeonData.guildId);
                const user = guild?.members.cache.get(raiderId)?.user;
                return `${acc}\n${user?.toString()}`;
              }, "")
            : "None"
        }`,
      }
    );

  return embed;
};

export const createRaidDescription = (
  raidData: RaidModelInterface,
  url: string
) => {
  return `CONFIRMED: **${raidData.raiders.yes.length}** / RESERVES: **${
    raidData.raiders.reserve.length
  }** / MAYBES: **${raidData.raiders.maybe.length}**\nNEEDED: **${Math.max(
    0,
    6 - (raidData.raiders.yes.length + raidData.raiders.reserve.length)
  )}**\nRegister here: ${url}`;
};

export const createDungeonDescription = (
  dungeonData: DungeonModelInterface,
  url: string
) => {
  return `CONFIRMED: **${dungeonData.players.yes.length}** / RESERVES: **${
    dungeonData.players.reserve.length
  }** / MAYBES: **${dungeonData.players.maybe.length}**\nNEEDED: **${Math.max(
    0,
    6 - (dungeonData.players.yes.length + dungeonData.players.reserve.length)
  )}**\nRegister here: ${url}`;
};
