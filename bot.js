const Discord = require("discord.js");
const firebase = require("firebase");
const client = new Discord.Client();


firebase.initializeApp({
 appName: "dota-button-bot",
 databaseURL: "https:\/\/dota-button-bot.firebaseio.com/",
});

const db = firebase.database();

const responses = [
	["Whoops! You must be new around here, ${USER}. We try not to mention DOTA so much in this channel. Have a good one :)"],
	[
		"Just a friendly reminder not to mention DOTA so much :smile: That's only ${TIMES} times now, so you're not in trouble yet, mkay? :smile:",
		"Hey, ${USER}, remember that thing about mentioning DOTA? Dw, it's cool, just be a little more mindful since that's ${TIMES} times now :smile:",
		"Oops, you mentioned DOTA again! That's ${TIMES} times, try not to do it any more :smile:"
	],
	[
		"Cool it with the DOTA references, alright ${USER}? That's ${TIMES} times now", 
		"Haha, you're just messing with me right ${USER}? That's {TIMES} times now",
		"Heeeeeeyyyyy, ${USER}, I thought I asked you kindly not to mention DOTA. Please respect my authority around here. I don't like to be the bad guy"
		"Dude, cmon. ${TIMES} times? Not cool."
	],
	[
		"What's the matter with you, ${USER}? Are you just trying to antagonize me? That's ${TIMES} damn times now",
		"COOL IT, ALRIGHT ${USER}? ${TIMES} times is PLENTY. Don't make me get ugly",
		"WILL YOU STOP THAT, ${USER}? ${TIMES} times is getting a little excessive, and I'm starting to get a little mad"
	],
	[
		"Alright you listen here fucko, that's ${TIMES} times. ${TIMES} GODDAMN TIMES.",
		"@Clome BAN THIS GUY. ${TIMES} mentions of DOTA!",
		"Oooooohhhh you cheeky bugger. ${TIMES} times? Say DOTA again. I dare you. I double dog dare you."
	]
]

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
        .catch((err) => {message.channel.send("Whoops, couldn't join the voice channel for some reason: ", err)});
    } else {
      message.reply("No hitting the button unless you're in a voice channel");
    }
  }

  else if (message.content.toLowerCase().includes("dota") || message.content.toLowerCase().includes("defense of the ancients")) {
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

function reply(offenses, user) {

}

client.login(process.env.BOT_TOKEN);