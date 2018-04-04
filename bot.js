const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {
  if (message.content.startsWith("ping")) {
    message.channel.send("pong!");
  }
});

client.login("NDMwODcxMTA4NzE2MTk5OTQ4.DaWfkQ.idnmtfhABtG83spxmPZFqMK8ZG4");