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
          dispatcher.on("end", end => {
          	message.member.voiceChannel.leave();
          })
        })
        .catch((err) => {message.channel.send("Whoops, couldn't join the voice channel because: " + err)});
    } else {
      message.reply("No hitting the button unless you're in a voice channel");
    }
  }

  else if (message.content.startsWith("!!report")) {
  	message.channel.send(message.author.id):
	if(message.author.id==210224301671055360 || message.author.id==210209958808125441) {
		let msg = message.content;
		let username = msg.substring(msg.indexOf(' '));
		message.channel.send("You reported " + username);
		let offender = message.members.find('username', username);
		if(!offender) message.channel.send(`Couldn't find the offender ${username}. Check your spelling and/or formatting`);
		else if(!offender.id == 430871108716199948) message.channel.send("Haha, very funny. I would never do anything reportable though");
		else {
			let str = `BZZZZZZZZ! ${username} mentioned DOTA!`;
			db.ref(`offenses/${message.guild.id}/${message.channel.name}/${offender.username}`).once('value').then((response) => {
		  		response = response.val();
		  		if(!response) numOffenses = 0;
		  		else numOffenses = response.numOffenses;
		  		numOffenses += 1;
		  		str += "\n" + reprimand(numOffenses, username);
		    	message.channel.send(str);
		  		db.ref(`offenses/${message.guild.id}/${message.channel.name}/${offender.username}`).set({numOffenses: numOffenses});
		  	})
		  	.catch((err) => {
		  		str += "\n" + "Something went wrong when I was thinking of a reply, but I'm very mad at you, " + username + ", regardless"
		  		message.channel.send(str);
		  	})
		}
	} else {
		message.channel.send("Nah, I don't have to listen to you");
	}
  }

  else if (replaceForDetection(message.content.toLowerCase()).includes("dota") || replaceForDetection(message.content.toLowerCase()).includes("defense of the ancients")) {
  	let user=message.author.username;
  	let str = `BZZZZZZZZ! ${user} mentioned DOTA!`;
  	db.ref(`offenses/${message.guild.id}/${message.channel.name}/${user}`).once('value').then((response) => {
  		response = response.val();
  		if(!response) numOffenses = 0;
  		else numOffenses = response.numOffenses;
  		numOffenses += 1;
  		str += "\n" + reprimand(numOffenses, user);
    	message.channel.send(str);
  		db.ref(`offenses/${message.guild.id}/${message.channel.name}/${user}`).set({numOffenses: numOffenses});
  	})
  	.catch((err) => {
  		str += "\n" + "Something went wrong when I was thinking of a reply, but I'm very mad at you, " + message.author.username + ", regardless"
  		message.channel.send(str);
  	})

  }
});

function reprimand(offenses, user) {
	let timesReplace = /\${TIMES}/g;
	let userReplace = /\${USER}/g;

	if(offenses <= 1) return responses.firstResponse.replace(userReplace, user).replace(timesReplace, offenses);

	let index = Math.floor((offenses-1) / 5);
	index = Math.min(index, responses.responses.length-1);

	let resp = randomElementFromArray(responses.responses[index]);

	return resp.replace(userReplace, user).replace(timesReplace, offenses);
}

function randomElementFromArray(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function replaceForDetection(str) {
	str = str.replace(/\W/g, '');
	let replaceObj = {
		'4': 'a',
		'0': 'o',
		'7': 't',
		'3': 'e',
		'α': 'a'
	}
	return allReplace(str, replaceObj);
}

function allReplace(str, obj) {
    var retStr = str;
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
    }
    return retStr;
};

client.login(process.env.BOT_TOKEN);