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
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const interaction_1 = __importDefault(require("./events/interaction"));
const ready_1 = __importDefault(require("./events/ready"));
const client_1 = __importDefault(require("./lib/client"));
mongoose_1.default
    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.jovfr.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    client_1.default.login(process.env.DISCORD_AUTH_TOKEN);
    client_1.default.once("ready", () => {
        (0, ready_1.default)(client_1.default);
    });
    client_1.default.on("interactionCreate", (interaction) => {
        (0, interaction_1.default)(interaction);
    });
}));
