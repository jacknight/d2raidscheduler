import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ButtonInteraction,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  TextBasedChannel,
  VoiceChannel,
} from "discord.js";
import { CommandInterface } from "../interfaces/command";
import { DateTime } from "luxon";
import RaidModel, { RaidModelInterface } from "../db/models/RaidModel";
import shortUUID from "short-uuid";
import {
  createRaidDescription,
  createRaidEmbed,
  scheduleEventTimeouts,
} from "../lib/util";
import client from "../lib/client";
import { ScheduledEventResponse } from "../lib/types";
import { readFile, readFileSync } from "fs";
import path from "path";

export enum Raids {
  "Leviathan",
  "Last Wish",
  "Scourge of the Past",
  "Crown of Sorrow",
  "Garden of Salvation",
  "Deep Stone Crypt",
  "Vault of Glass",
  "Vow of the Disciple",
  "Kings Fall",
}

const commandName = "raid";

const raidCommand: CommandInterface = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Schedule a raid")
    .addIntegerOption((option) => {
      return option
        .setName("name")
        .setDescription("Raid")
        .setRequired(true)
        .addChoices(
          {
            name: "Leviathan",
            value: Raids["Leviathan"],
          },
          {
            name: "Last Wish",
            value: Raids["Last Wish"],
          },
          {
            name: "Scourge of the Past",
            value: Raids["Scourge of the Past"],
          },
          {
            name: "Crown of Sorrow",
            value: Raids["Scourge of the Past"],
          },
          {
            name: "Garden of Salvation",
            value: Raids["Garden of Salvation"],
          },
          {
            name: "Deep Stone Crypt",
            value: Raids["Deep Stone Crypt"],
          },
          {
            name: "Vault of Glass",
            value: Raids["Vault of Glass"],
          },
          {
            name: "Vow of the Disciple",
            value: Raids["Vow of the Disciple"],
          },
          {
            name: "Kings Fall",
            value: Raids["Kings Fall"],
          }
        );
    })
    .addIntegerOption((option) => {
      return option
        .setName("year")
        .setDescription("Full year")
        .setRequired(true)
        .addChoices(
          {
            name: new Date().toISOString().slice(0, 4),
            value: Number(new Date().toISOString().slice(0, 4)),
          },
          {
            name: (Number(new Date().toISOString().slice(0, 4)) + 1).toString(),
            value: Number(new Date().toISOString().slice(0, 4)) + 1,
          }
        );
    })
    .addIntegerOption((option) => {
      return option
        .setName("month")
        .setDescription("Month")
        .setRequired(true)
        .addChoices(
          { name: "January", value: 0 },
          { name: "February", value: 1 },
          { name: "March", value: 2 },
          { name: "April", value: 3 },
          { name: "May", value: 4 },
          { name: "June", value: 5 },
          { name: "July", value: 6 },
          { name: "August", value: 7 },
          { name: "September", value: 8 },
          { name: "October", value: 9 },
          { name: "November", value: 10 },
          { name: "December", value: 11 }
        );
    })
    .addIntegerOption((option) => {
      return option.setName("day").setDescription("Day").setRequired(true);
    })
    .addIntegerOption((option) => {
      return option
        .setName("hour")
        .setDescription("Hour (24h time)")
        .setRequired(true);
    })
    .addIntegerOption((option) => {
      return option.setName("min").setDescription("Minute").setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName("timezone")
        .setDescription("Timezone")
        .setRequired(true)
        .addChoices(
          { name: "US East", value: "America/New_York" },
          { name: "US Central", value: "America/Chicago" },
          { name: "US Mountain", value: "America/Denver" },
          { name: "US West", value: "America/Los_Angeles" }
        );
    }),

  run: async (interaction: CommandInteraction) => {
    try {
      const msg = (await interaction.deferReply({
        fetchReply: true,
      })) as Message;
      const today = new Date();

      const raid = interaction.options.getInteger("name", true);
      const year = interaction.options.getInteger("year", true);
      const month = interaction.options.getInteger("month", true) + 1;
      const day = interaction.options.getInteger("day", true);
      const hour = interaction.options.getInteger("hour", true);
      const minute = interaction.options.getInteger("min", true);
      const zone = interaction.options.getString("timezone", true);

      const raidDate = DateTime.fromObject(
        { year, month, day, hour, minute },
        { zone }
      ).toJSDate();

      const raidDateStr = raidDate.toLocaleString("en-us", {
        dateStyle: "full",
        timeStyle: "full",
        timeZone: zone,
      });

      if (raidDate.toString() === "Invalid Date") {
        return interaction.editReply({
          content: "Invalid date.",
        });
      }

      if (raidDate < new Date()) {
        return interaction.editReply({
          content: `Date is in the past: ${raidDateStr}`,
        });
      }

      const raidData: RaidModelInterface = {
        id: shortUUID.generate(),
        date: raidDate,
        zone,
        raid,
        raiders: {
          yes: [],
          no: [],
          maybe: [],
          reserve: [],
        },
        status: "pending",
        duration: 0,
        guildId: interaction.guildId!,
        channelId: interaction.channelId,
        messageId: msg.id,
        scheduledEventId: "",
      };

      const image = `https://raw.githubusercontent.com/jacknight/d2raidscheduler/master/src/assets/${Raids[
        raid
      ]
        .split(" ")
        .join("_")
        .toLowerCase()}_banner.png`;
      const scheduledEvent = await interaction.guild?.scheduledEvents.create({
        name: `${Raids[raid]} Raid`,
        image,
        entityType: "VOICE",
        privacyLevel: "GUILD_ONLY",
        scheduledStartTime: raidDate,
        description: createRaidDescription(raidData, msg.url),
        channel: interaction.guild?.channels.cache.find(
          (channel) => channel.type === "GUILD_VOICE"
        ) as VoiceChannel,
      });

      raidData.scheduledEventId = scheduledEvent!.id;

      await RaidModel.create(raidData);

      scheduleEventTimeouts(raidData.id, "raid");

      const raidEmbed = createRaidEmbed(raidData);

      const respond = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(`${commandName}-${raidData.id}-yes`)
          .setLabel("I'm in!")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId(`${commandName}-${raidData.id}-reserve`)
          .setLabel("Available on reserve.")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId(`${commandName}-${raidData.id}-maybe`)
          .setLabel("Maybe")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setCustomId(`${commandName}-${raidData.id}-no`)
          .setLabel("I'm out.")
          .setStyle("DANGER")
      );
      interaction.editReply({
        embeds: [raidEmbed],
        components: [respond],
      });
    } catch (e: any) {
      console.error(e);
    }
  },

  handleButton: async (interaction: ButtonInteraction) => {
    try {
      const raidId: string = interaction.customId.split("-")[1];
      const resp = interaction.customId.split("-")[2] as ScheduledEventResponse;

      await interaction.deferReply({ ephemeral: true, fetchReply: true });

      // Retrieve raid from database
      const raidData: RaidModelInterface | null = await RaidModel.findOne({
        id: raidId,
      });

      if (raidData) {
        // First check if they've already hit a button
        let idx = raidData.raiders.yes.indexOf(interaction.user.id);
        if (idx >= 0) {
          raidData.raiders.yes.splice(idx, 1);
        }
        idx = raidData.raiders.no.indexOf(interaction.user.id);
        if (idx >= 0) {
          raidData.raiders.no.splice(idx, 1);
        }
        idx = raidData.raiders.maybe.indexOf(interaction.user.id);
        if (idx >= 0) {
          raidData.raiders.maybe.splice(idx, 1);
        }
        idx = raidData.raiders.reserve.indexOf(interaction.user.id);
        if (idx >= 0) {
          raidData.raiders.reserve.splice(idx, 1);
        }

        // If they answered 'yes', check if there's any space left on the raid
        // squad and if not, add them to 'reserve'
        if (resp === "yes" && raidData.raiders.yes.length >= 6) {
          raidData.raiders.reserve.push(interaction.user.id);
        } else {
          raidData.raiders[resp].push(interaction.user.id);
        }

        await RaidModel.updateOne({ id: raidId }, raidData);

        const guild = client.guilds.cache.get(raidData.guildId);
        const channel = guild?.channels.cache.get(
          raidData.channelId
        ) as TextBasedChannel;
        const msg = channel.messages.cache.get(raidData.messageId);

        msg?.edit({ embeds: [createRaidEmbed(raidData)] });

        const scheduledEvents = await guild?.scheduledEvents.fetch();
        const scheduledEvent = scheduledEvents?.get(raidData.scheduledEventId);

        if (scheduledEvent) {
          scheduledEvent.edit({
            description: createRaidDescription(raidData, msg!.url),
          });
        }

        return interaction.editReply({
          content: "Your selection has been confirmed!",
        });
      } else {
        console.error("No raid data? ", raidData, raidId);
        return interaction.editReply({
          content: "Sorry, there was some problem.",
        });
      }
    } catch (e: any) {
      console.error("Error on button handling: ", e);
      return interaction.editReply({
        content: "Sorry, there was some problem.",
      });
    }
  },
};

export default raidCommand;
