"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaidSchema = void 0;
const mongoose_1 = require("mongoose");
exports.RaidSchema = new mongoose_1.Schema({
    id: String,
    date: Date,
    zone: String,
    raid: Number,
    raiders: {
        yes: Array,
        no: Array,
        maybe: Array,
        reserve: Array,
    },
    status: String,
    duration: Number,
    guildId: String,
    channelId: String,
    messageId: String,
});
exports.default = (0, mongoose_1.model)("raid", exports.RaidSchema);
