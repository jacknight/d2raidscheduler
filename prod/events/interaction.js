"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _commands_1 = __importDefault(require("../commands/_commands"));
const onInteraction = (interaction) => {
    if (interaction.isCommand()) {
        for (const command of _commands_1.default) {
            if (command.data.name === interaction.commandName) {
                command.run(interaction);
                break;
            }
        }
    }
    else if (interaction.isButton()) {
        for (const command of _commands_1.default) {
            if (command.data.name === interaction.customId.split("-")[0]) {
                command.handleButton
                    ? command.handleButton(interaction)
                    : console.log("Handle button not defined for button interaction: ", interaction);
                break;
            }
        }
    }
};
exports.default = onInteraction;
