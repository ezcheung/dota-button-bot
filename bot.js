const Discord = require("discord.js");
const auth = require("./auth");
const firebase = require("firebase");
const client = new Discord.Client();


firebase.initializeApp({
 appName: "dota-button-bot",
 databaseURL: "https:\/\/dota-button-bot.firebaseio.com/",
});

const db = firebase.database();

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {
  console.log("Message received");
  console.log("User: ", message.author.id);
  if(message.author.id==430871108716199948) return;

  if (message.content.toLowerCase().includes("dota")) {
  	let user=message.author.username;
  	let str = `BZZZZZZZZ! ${user} mentioned DOTA!`;
  	db.ref(`offenses/${message.guild.id}/${message.channel.name}/${user}`).once('value').then((response) => {
  		response = response.val();
  		let numOffenses = response.numOffenses;
  		if(!response.numOffenses) numOffenses = 0;
  		numOffenses += 1;
  		str += "\n" + `${message.author.username} has committed this offense in this channel ${numOffenses} time`;
  		if(numOffenses !== 1) str += "s";
    	message.channel.send(str);
  		db.ref(`offenses/${message.guild.id}/${message.channel.name}/${user}`).set({numOffenses: numOffenses});
  	})
  }
});

client.login(auth.token);