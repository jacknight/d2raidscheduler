// Require the necessary discord.js classes
import { Interaction } from "discord.js";
import "dotenv/config";
import mongoose from "mongoose";
import onInteraction from "./events/interaction";
import onReady from "./events/ready";
import client from "./lib/client";

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.jovfr.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(async () => {
    client.login(process.env.DISCORD_AUTH_TOKEN);

    client.once("ready", () => {
      onReady(client);
    });

    client.on("interactionCreate", (interaction: Interaction) => {
      onInteraction(interaction);
    });
  });
