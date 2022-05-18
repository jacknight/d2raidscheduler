"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Raids = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const luxon_1 = require("luxon");
const RaidModel_1 = __importDefault(require("../db/models/RaidModel"));
const short_uuid_1 = __importDefault(require("short-uuid"));
const util_1 = require("../lib/util");
const client_1 = __importDefault(require("../lib/client"));
var Raids;
(function (Raids) {
    Raids[Raids["Leviathan"] = 0] = "Leviathan";
    Raids[Raids["Last Wish"] = 1] = "Last Wish";
    Raids[Raids["Scourge of the Past"] = 2] = "Scourge of the Past";
    Raids[Raids["Crown of Sorrow"] = 3] = "Crown of Sorrow";
    Raids[Raids["Garden of Salvation"] = 4] = "Garden of Salvation";
    Raids[Raids["Deep Stone Crypt"] = 5] = "Deep Stone Crypt";
    Raids[Raids["Vault of Glass"] = 6] = "Vault of Glass";
    Raids[Raids["Vow of the Disciple"] = 7] = "Vow of the Disciple";
})(Raids = exports.Raids || (exports.Raids = {}));
const commandName = "raid";
const raidCommand = {
    data: new builders_1.SlashCommandBuilder()
        .setName(commandName)
        .setDescription("Schedule a raid")
        .addIntegerOption((option) => {
        return option
            .setName("name")
            .setDescription("Raid")
            .setRequired(true)
            .addChoices({
            name: "Leviathan",
            value: Raids["Leviathan"],
        }, {
            name: "Last Wish",
            value: Raids["Last Wish"],
        }, {
            name: "Scourge of the Past",
            value: Raids["Scourge of the Past"],
        }, {
            name: "Crown of Sorrow",
            value: Raids["Scourge of the Past"],
        }, {
            name: "Garden of Salvation",
            value: Raids["Garden of Salvation"],
        }, {
            name: "Deep Stone Crypt",
            value: Raids["Deep Stone Crypt"],
        }, {
            name: "Vault of Glass",
            value: Raids["Vault of Glass"],
        }, {
            name: "Vow of the Disciple",
            value: Raids["Vow of the Disciple"],
        });
    })
        .addIntegerOption((option) => {
        return option
            .setName("year")
            .setDescription("Full year")
            .setRequired(true)
            .addChoices({ name: "2022", value: 2022 }, { name: "2023", value: 2023 });
    })
        .addIntegerOption((option) => {
        return option
            .setName("month")
            .setDescription("Month")
            .setRequired(true)
            .addChoices({ name: "January", value: 0 }, { name: "February", value: 1 }, { name: "March", value: 2 }, { name: "April", value: 3 }, { name: "May", value: 4 }, { name: "June", value: 5 }, { name: "July", value: 6 }, { name: "August", value: 7 }, { name: "September", value: 8 }, { name: "October", value: 9 }, { name: "November", value: 10 }, { name: "December", value: 11 });
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
            .addChoices({ name: "America/New_York", value: "America/New_York" }, { name: "America/Chicago", value: "America/Chicago" }, { name: "America/Denver", value: "America/Denver" }, { name: "America/Los_Angeles", value: "America/Los_Angeles" });
    }),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        const msg = yield interaction.deferReply({
            fetchReply: true,
        });
        const today = new Date();
        const raid = interaction.options.getInteger("name", true);
        const year = interaction.options.getInteger("year", true);
        const month = interaction.options.getInteger("month", true) + 1;
        const day = interaction.options.getInteger("day", true);
        const hour = interaction.options.getInteger("hour", true);
        const minute = interaction.options.getInteger("min", true);
        const zone = interaction.options.getString("timezone", true);
        const raidDate = luxon_1.DateTime.fromObject({ year, month, day, hour, minute }, { zone }).toJSDate();
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
        const raidData = {
            id: short_uuid_1.default.generate(),
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
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            messageId: msg.id,
        };
        yield RaidModel_1.default.create(raidData);
        const raidEmbed = (0, util_1.createRaidEmbed)(raidData);
        const respond = new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
            .setCustomId(`${commandName}-${raidData.id}-yes`)
            .setLabel("I'm in!")
            .setStyle("SUCCESS"), new discord_js_1.MessageButton()
            .setCustomId(`${commandName}-${raidData.id}-reserve`)
            .setLabel("I'll be available on reserve.")
            .setStyle("SECONDARY"), new discord_js_1.MessageButton()
            .setCustomId(`${commandName}-${raidData.id}-maybe`)
            .setLabel("Maybe...")
            .setStyle("PRIMARY"), new discord_js_1.MessageButton()
            .setCustomId(`${commandName}-${raidData.id}-no`)
            .setLabel("I'm out, sorry.")
            .setStyle("DANGER"));
        interaction.editReply({ embeds: [raidEmbed], components: [respond] });
    }),
    handleButton: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        const raidId = interaction.customId.split("-")[1];
        const resp = interaction.customId.split("-")[2];
        // Retrieve raid from database
        const raidData = yield RaidModel_1.default.findOne({
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
            }
            else {
                raidData.raiders[resp].push(interaction.user.id);
            }
            yield RaidModel_1.default.updateOne({ id: raidId }, raidData);
            const guild = client_1.default.guilds.cache.get(raidData.guildId);
            const channel = guild === null || guild === void 0 ? void 0 : guild.channels.cache.get(raidData.channelId);
            const msg = channel.messages.cache.get(raidData.messageId);
            msg === null || msg === void 0 ? void 0 : msg.edit({ embeds: [(0, util_1.createRaidEmbed)(raidData)] });
            return interaction.reply({
                content: "Your selection has been confirmed!",
                ephemeral: true,
            });
        }
        else {
            return interaction.reply({
                content: "Sorry, there was some problem.",
                ephemeral: true,
            });
        }
    }),
};
exports.default = raidCommand;
