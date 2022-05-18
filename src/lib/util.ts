import { MessageEmbed } from "discord.js";
import { Raids } from "../commands/raid";
import { RaidModelInterface } from "../db/models/RaidModel";
import client from "./client";

export const createRaidEmbed = (raidData: RaidModelInterface): MessageEmbed => {
  const guardiansNeeded = (
    6 -
    raidData.raiders.yes.length -
    raidData.raiders.reserve.length
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
        name: "Status",
        value: raidData.status,
        inline: true,
      },
      {
        name: "Guardians Needed",
        value: guardiansNeeded,
        inline: true,
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
