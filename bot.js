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
  	if(offender.user.id == 430871108716199948) message.channel.send("Haha, very funny");
	if(message.author.id==210224301671055360 || message.author.id==210209958808125441) {
		let msg = message.content;
		let username = msg.substring(msg.indexOf(' ')+1);
		if(!username.length){
			message.channel.send("You gotta give me a username, man");
			return;
		}
		let offender = message.guild.members.find((member) => {
			return member.user.username == username;
		});
		if(!offender) message.channel.send(`Couldn't find the offender ${username}. Check your spelling and/or formatting`);
		else {
			let str = `BZZZZZZZZ! ${username} mentioned DOTA!`;
			db.ref(`offenses/${message.guild.id}/${message.channel.name}/${username}`).once('value').then((response) => {
		  		response = response.val();
		  		if(!response) numOffenses = 0;
		  		else numOffenses = response.numOffenses;
		  		numOffenses += 1;
		  		str += "\n" + reprimand(numOffenses, username);
		    	message.channel.send(str);
		  		db.ref(`offenses/${message.guild.id}/${message.channel.name}/${username}`).set({numOffenses: numOffenses});
		  	})
		  	.catch((err) => {
		  		str += "\n" + "Something went wrong when I was thinking of a reply, but I'm very mad at you, " + username + ", regardless"
		  		message.channel.send(str);
		  	})
		}
	} else {
		message.channel.send("Lol who even is you");
	}
  }

  else if (replaceForDetection(message.content.toLowerCase()).includes("dota") || replaceForDetection(message.content.toLowerCase()).includes("defense of the ancients")) {
  	let user=message.author.username;
  	let str = `BZZZZZZZZ! ${user} mentioned DOTA!`;
  	db.ref(`offenses/${message.guild.id}/${message.channel.name}/${user}`).once('value').then((response) => {
  		response = response.val();
  		if(!response) {
  			numOffenses = 0;
  			spamCount = 0;
  		}
  		else {
  			numOffenses = response.numOffenses || 0;
  			spamCount = response.spamCount || 0;
  		}
  		numOffenses += 1;
  		str += "\n" + reprimand(numOffenses, user);
    	message.channel.send(str);
    	if(response && response.lastOffense) {
    		let interval = Date.now()-response.lastOffense;
    		if(interval/1000/60 <= 2) {
    			spamCount += 1;
    			let penaltyRole=message.guild.roles.find("name","Penalty Box")
    			message.channel.send(penaltyRole)
    			if(spamCount >= 4 && !message.member.roles.some(r => r.name === penaltyRole.name)) {
    				let offender=message.member;
    				let minutes=2
    				offender.addRole(penaltyRole);
    				setTimeout(() => offender.removeRole(penaltyRole),minutes*60000)
    				message.channel.send(user+" has been put in the penalty box for " + minutes + " minutes.\nPlease don't make me spam the channel, I get very tired of buzzing")
    			}
    		}
    		else spamCount=0;
    	}
  		db.ref(`offenses/${message.guild.id}/${message.channel.name}/${user}`).set({numOffenses: numOffenses, lastOffense: Date.now(), spamCount: spamCount});
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

	let index = Math.floor((offenses-1) / 4);
	index = Math.min(index, responses.responses.length-1);

	let resp = randomElementFromArray(responses.responses[index]);

	return resp.replace(userReplace, user).replace(timesReplace, offenses);
}

function randomElementFromArray(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function replaceForDetection(str) {
	let replaceObj = {
		'4': 'a',
		'0': 'o',
		'7': 't',
		'3': 'e',
		'α': 'a'
	}
	str = allReplace(str, replaceObj);
	return str.replace(/\W/g, '');
}

function allReplace(str, obj) {
    var retStr = str;
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
    }
    return retStr;
};

client.login(process.env.BOT_TOKEN);