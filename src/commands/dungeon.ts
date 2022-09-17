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
import shortUUID from "short-uuid";
import { createDungeonDescription, createDungeonEmbed } from "../lib/util";
import client from "../lib/client";
import { ScheduledEventResponse } from "../lib/types";
import DungeonModel, { DungeonModelInterface } from "../db/models/DungeonModel";

export enum Dungeons {
  "Shattered Throne",
  "Pit of Heresy",
  "Prophecy",
  "Grasp of Avarice",
  "Duality",
}

const commandName = "dungeon";

const dungeonCommand: CommandInterface = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Schedule a dungeon")
    .addIntegerOption((option) => {
      return option
        .setName("name")
        .setDescription("Dungeon")
        .setRequired(true)
        .addChoices(
          {
            name: "Shattered Throne",
            value: Dungeons["Shattered Throne"],
          },
          {
            name: "Prophecy",
            value: Dungeons["Prophecy"],
          },
          {
            name: "Pit of Heresy",
            value: Dungeons["Pit of Heresy"],
          },
          {
            name: "Gras of Avarice",
            value: Dungeons["Grasp of Avarice"],
          },
          {
            name: "Duality",
            value: Dungeons["Duality"],
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

      const dungeon = interaction.options.getInteger("name", true);
      const year = interaction.options.getInteger("year", true);
      const month = interaction.options.getInteger("month", true) + 1;
      const day = interaction.options.getInteger("day", true);
      const hour = interaction.options.getInteger("hour", true);
      const minute = interaction.options.getInteger("min", true);
      const zone = interaction.options.getString("timezone", true);

      const dungeonDate = DateTime.fromObject(
        { year, month, day, hour, minute },
        { zone }
      ).toJSDate();

      const dungeonDateStr = dungeonDate.toLocaleString("en-us", {
        dateStyle: "full",
        timeStyle: "full",
        timeZone: zone,
      });

      if (dungeonDate.toString() === "Invalid Date") {
        return interaction.editReply({
          content: "Invalid date.",
        });
      }

      if (dungeonDate < new Date()) {
        return interaction.editReply({
          content: `Date is in the past: ${dungeonDateStr}`,
        });
      }

      const dungeonData: DungeonModelInterface = {
        id: shortUUID.generate(),
        date: dungeonDate,
        zone,
        dungeon,
        players: {
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

      const scheduledEvent = await interaction.guild?.scheduledEvents.create({
        name: `${Dungeons[dungeon]} Run`,
        entityType: "VOICE",
        privacyLevel: "GUILD_ONLY",
        scheduledStartTime: dungeonDate,
        description: createDungeonDescription(dungeonData, msg.url),
        channel: interaction.guild?.channels.cache.find(
          (channel) => channel.type === "GUILD_VOICE"
        ) as VoiceChannel,
      });

      dungeonData.scheduledEventId = scheduledEvent!.id;

      await DungeonModel.create(dungeonData);

      const dungeonEmbed = createDungeonEmbed(dungeonData);

      const respond = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(`${commandName}-${dungeonData.id}-yes`)
          .setLabel("I'm in!")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId(`${commandName}-${dungeonData.id}-reserve`)
          .setLabel("Available on reserve.")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId(`${commandName}-${dungeonData.id}-maybe`)
          .setLabel("Maybe")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setCustomId(`${commandName}-${dungeonData.id}-no`)
          .setLabel("I'm out.")
          .setStyle("DANGER")
      );
      interaction.editReply({
        embeds: [dungeonEmbed],
        components: [respond],
      });
    } catch (e: any) {
      console.error(e);
    }
  },

  handleButton: async (interaction: ButtonInteraction) => {
    try {
      const dungeonId: string = interaction.customId.split("-")[1];
      const resp = interaction.customId.split("-")[2] as ScheduledEventResponse;

      await interaction.deferReply({ ephemeral: true, fetchReply: true });

      // Retrieve dungeon from database
      const dungeonData: DungeonModelInterface | null =
        await DungeonModel.findOne({
          id: dungeonId,
        });

      if (dungeonData) {
        // First check if they've already hit a button
        let idx = dungeonData.players.yes.indexOf(interaction.user.id);
        if (idx >= 0) {
          dungeonData.players.yes.splice(idx, 1);
        }
        idx = dungeonData.players.no.indexOf(interaction.user.id);
        if (idx >= 0) {
          dungeonData.players.no.splice(idx, 1);
        }
        idx = dungeonData.players.maybe.indexOf(interaction.user.id);
        if (idx >= 0) {
          dungeonData.players.maybe.splice(idx, 1);
        }
        idx = dungeonData.players.reserve.indexOf(interaction.user.id);
        if (idx >= 0) {
          dungeonData.players.reserve.splice(idx, 1);
        }

        // If they answered 'yes', check if there's any space left on the dungeon
        // squad and if not, add them to 'reserve'
        if (resp === "yes" && dungeonData.players.yes.length >= 6) {
          dungeonData.players.reserve.push(interaction.user.id);
        } else {
          dungeonData.players[resp].push(interaction.user.id);
        }

        await DungeonModel.updateOne({ id: dungeonId }, dungeonData);

        const guild = client.guilds.cache.get(dungeonData.guildId);
        const channel = guild?.channels.cache.get(
          dungeonData.channelId
        ) as TextBasedChannel;
        const msg = channel.messages.cache.get(dungeonData.messageId);

        msg?.edit({ embeds: [createDungeonEmbed(dungeonData)] });

        const scheduledEvents = await guild?.scheduledEvents.fetch();
        const scheduledEvent = scheduledEvents?.get(
          dungeonData.scheduledEventId
        );

        if (scheduledEvent) {
          scheduledEvent.edit({
            description: createDungeonDescription(dungeonData, msg!.url),
          });
        }

        return interaction.editReply({
          content: "Your selection has been confirmed!",
        });
      } else {
        console.error("No dungeon data? ", dungeonData, dungeonId);
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

export default dungeonCommand;
