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
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const _commands_1 = __importDefault(require("../commands/_commands"));
const onReady = (client) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const rest = new rest_1.REST().setToken(process.env.DISCORD_AUTH_TOKEN);
    const commandData = _commands_1.default.map((command) => command.data.toJSON());
    const promises = [];
    (_a = client.application) === null || _a === void 0 ? void 0 : _a.commands.cache.forEach((command) => {
        promises.push(command.delete());
    });
    client.guilds.cache.forEach((guild) => {
        guild.commands.cache.forEach((command) => {
            promises.push(command.delete());
        });
    });
    Promise.all(promises);
    console.log("Global and guild commands deleted. Registering most recent version.");
    yield rest.put(v9_1.Routes.applicationCommands(client.application.id), {
        body: commandData,
    });
    console.log("Commands registered. Bot is ready.");
});
exports.default = onReady;
