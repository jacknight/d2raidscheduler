"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRaidEmbed = void 0;
const discord_js_1 = require("discord.js");
const raid_1 = require("../commands/raid");
const client_1 = __importDefault(require("./client"));
const createRaidEmbed = (raidData) => {
    const guardiansNeeded = (6 -
        raidData.raiders.yes.length -
        raidData.raiders.reserve.length).toString();
    const embed = new discord_js_1.MessageEmbed()
        .setTitle(`${raid_1.Raids[raidData.raid]} Raid`)
        .setColor(0xffffff)
        .addFields({
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
    }, {
        name: "Status",
        value: raidData.status,
        inline: true,
    }, {
        name: "Guardians Needed",
        value: guardiansNeeded,
        inline: true,
    })
        .addFields({
        inline: true,
        name: "Confirmed",
        value: `${raidData.raiders.yes.length > 0
            ? raidData.raiders.yes.reduce((acc, raiderId) => {
                var _a;
                const guild = client_1.default.guilds.cache.get(raidData.guildId);
                const user = (_a = guild === null || guild === void 0 ? void 0 : guild.members.cache.get(raiderId)) === null || _a === void 0 ? void 0 : _a.user;
                return `${acc}\n${user === null || user === void 0 ? void 0 : user.toString()}`;
            }, "")
            : "None"}`,
    }, {
        inline: true,
        name: "Reserves",
        value: `${raidData.raiders.reserve.length > 0
            ? raidData.raiders.reserve.reduce((acc, raiderId) => {
                var _a;
                const guild = client_1.default.guilds.cache.get(raidData.guildId);
                const user = (_a = guild === null || guild === void 0 ? void 0 : guild.members.cache.get(raiderId)) === null || _a === void 0 ? void 0 : _a.user;
                return `${acc}\n${user === null || user === void 0 ? void 0 : user.toString()}`;
            }, "")
            : "None"}`,
    }, {
        inline: true,
        name: "Maybes",
        value: `${raidData.raiders.maybe.length > 0
            ? raidData.raiders.maybe.reduce((acc, raiderId) => {
                var _a;
                const guild = client_1.default.guilds.cache.get(raidData.guildId);
                const user = (_a = guild === null || guild === void 0 ? void 0 : guild.members.cache.get(raiderId)) === null || _a === void 0 ? void 0 : _a.user;
                return `${acc}\n${user === null || user === void 0 ? void 0 : user.toString()}`;
            }, "")
            : "None"}`,
    });
    return embed;
};
exports.createRaidEmbed = createRaidEmbed;
