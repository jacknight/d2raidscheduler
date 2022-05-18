"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Require the necessary discord.js classes
const discord_js_1 = require("discord.js");
// Create a new client instance
const client = new discord_js_1.Client({
    intents: [discord_js_1.Intents.FLAGS.GUILDS],
});
exports.default = client;
