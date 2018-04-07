const Discord = require("discord.js");
const firebase = require("firebase");
const client = new Discord.Client();


firebase.initializeApp({
 appName: "dota-button-bot",
 databaseURL: "https:\/\/dota-button-bot.firebaseio.com/",
});

const db = firebase.database();

const responses = require('./responses.json');

client.on("ready", () => {
});

client.on("message", (message) => {
  if(message.author.id==430871108716199948 || !message.guild) return;

  if (message.content === "!!button") {
    if (message.member.voiceChannel) {
      message.member.voiceChannel.join()
        .then(connection => {
          const dispatcher = connection.playFile('./buzzer.mp3');
          message.member.voiceChannel.leave();
        })
        .catch((err) => {message.channel.send("Whoops, couldn't join the voice channel because: " + err)});
    } else {
      message.reply("No hitting the button unless you're in a voice channel");
    }
  }

  else if (message.content.toLowerCase().includes("dota") || message.content.toLowerCase().includes("defense of the ancients")) {
  	let user=message.author.username;
  	let str = `BZZZZZZZZ! ${user} mentioned DOTA!`;
  	db.ref(`offenses/${message.guild.id}/${message.channel.name}/${user}`).once('value').then((response) => {
  		response = response.val();
  		if(!response) numOffenses = 0;
  		else numOffenses = response.numOffenses;
  		numOffenses += 1;
  		str += "\n" + reprimand(numOffenses, message.author.username);
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

function reprimand(offenses, user) {
	let timesReplace = /\${TIMES}/g;
	let userReplace = /\${USER}/g;

	if(offenses <= 1) return responses.firstResponse;

	offenses = offenses-1;
	let index = Math.floor(offenses / 5);
	index = Math.min(index, responses.responses.length);

	let resp = randomElementFromArray(responses.responses[index]);

	return resp.replace(userReplace, user).replace(timesReplace, offenses);
}

function randomElementFromArray(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

client.login(process.env.BOT_TOKEN);