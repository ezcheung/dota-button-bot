const Discord = require("discord.js");
const firebase = require("firebase");
const client = new Discord.Client();


firebase.initializeApp({
 appName: "dota-button-bot",
 databaseURL: "https:\/\/dota-button-bot.firebaseio.com/",
});

const db = firebase.database();

client.on("ready", () => {
});

client.on("message", (message) => {
  if(message.author.id==430871108716199948 || !message.guild) return;

  if (message.content === "!!button") {
    if (message.member.voiceChannel) {
      message.member.voiceChannel.join()
        .then(connection => {
          const dispatcher = connection.playFile('./buzzer.mp3');
        })
        .catch((err) => {message.channel.send("Whoops, couldn't join the voice channel for some reason")});
    } else {
      message.reply("No hitting the button unless you're in a voice channel");
    }
  }

  else if (message.content.toLowerCase().includes("dota")) {
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
  	.catch((err) => {
  		db.ref(`offenses/${message.guild.id}/${message.channel.name}/${user}`).set({numOffenses: 1});
  		str += "\n" + `${message.author.username} has committed this offense in this channel 1 time`;
  		message.channel.send(str);
  	})
  }
});

client.login(process.env.BOT_TOKEN);