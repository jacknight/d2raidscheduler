import { channel } from "diagnostics_channel";
import { Client, Message, MessageEmbed, TextBasedChannel } from "discord.js";
import { GuildScheduledEventStatuses } from "discord.js/typings/enums";
import { Dungeons } from "../commands/dungeon";
import { Raids } from "../commands/raid";
import DungeonModel, { DungeonModelInterface } from "../db/models/DungeonModel";
import RaidModel, { RaidModelInterface } from "../db/models/RaidModel";
import client from "./client";

const timeouts = [];

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
    3 - dungeonData.players.yes.length - dungeonData.players.reserve.length
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
    3 - (dungeonData.players.yes.length + dungeonData.players.reserve.length)
  )}**\nRegister here: ${url}`;
};

export const scheduleEventTimeouts = async (
  id: string,
  type: "raid" | "dungeon"
) => {
  const data: (RaidModelInterface & DungeonModelInterface) | null =
    type === "raid"
      ? await RaidModel.findOne({ id })
      : await DungeonModel.findOne({ id });

  if (!data) return;

  const fifteenMinBefore =
    data.date.valueOf() - Date.now().valueOf() - 15 * 60 * 1000;

  (function (id, type) {
    if (fifteenMinBefore < 0) return;
    setTimeout(
      async () => {
        const data: (RaidModelInterface & DungeonModelInterface) | null =
          type === "raid"
            ? await RaidModel.findOne({ id })
            : await DungeonModel.findOne({ id });

        if (!data) return;

        const { date, guildId } = data;
        const players = type === "raid" ? data.raiders : data.players;
        const name =
          type === "raid" ? Raids[data.raid] : Dungeons[data.dungeon];

        let content = "Hey";

        const guild = client.guilds.cache.get(data.guildId);
        const channel = guild?.channels.cache.get(
          data.channelId
        ) as TextBasedChannel;
        const message = await (
          await channel.messages.fetch()
        ).find((m) => m.id === data.messageId);
        await Promise.all(
          players.yes.map(async (player) => {
            const user = guild?.members.cache.get(player);
            if (user) {
              content = `${content}, ${user}`;
            }
          })
        );
        content = `${content}: it's almost time to run ${name}!\n${
          message?.url || ""
        }`;

        await message?.reply({ content });
      },
      fifteenMinBefore // 15 min before
    );
  })(id, type);

  (function (id, type) {
    setTimeout(async () => {
      const data: (RaidModelInterface & DungeonModelInterface) | null =
        type === "raid"
          ? await RaidModel.findOne({ id })
          : await DungeonModel.findOne({ id });

      if (!data) return;

      const guild = client.guilds.cache.get(data.guildId);
      const scheduledEvent = guild?.scheduledEvents.cache.get(
        data.scheduledEventId
      );
      await scheduledEvent?.edit({
        status: GuildScheduledEventStatuses.ACTIVE,
      });
    }, data.date.valueOf() - Date.now().valueOf());
  })(id, type);
};
