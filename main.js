
// import the discord.js module
const Discord = require('discord.js');
const config = require('./config.js');


// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

// the token of your bot - https://discordapp.com/developers/applications/me
const token = config.token;

var fs = require('fs');


function getPong(max) {
  max = Math.floor(max);
  return Math.floor(Math.random() * (max + 1)); //The maximum is inclusive and the minimum is inclusive 
}




// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
bot.on('ready', () => {
  console.log('I am ready!');
});
bot.on('error', function(err){
    // handle the error safely
    console.log(err)
});




// {day:0, hour:8, minute:9, role_id:"<@&651108830956224515>", 
	// 	day_word:"Sunday", meet:"Tribe at 11:30am!",remind:false},
	// {day:6, hour:18, minute:9, role_id:"<@&651108830956224515>", 
	// 	day_word:"Sunday", meet:"Tribe at 11:30am!",remind:true},

const pingList = ["pong","pong","pong","pong","pong","pong","pong","pong","pong","pong","pong","pong",
			"pong","pong","pong","pong","pong","pong","pong","pong","pong","pong","pong","pong",
			"stahp","i got u","wat","wat do", "cash me ousside","no plz no","ooo-wee","oof","big mood",
			"im here", "relax bruh", "chill dawg", "naw, that aint me", "raspberry sherbert","get rekt skrub",
			"roundtrip 24.7ms\n...lol not really", "🇾", "💖💞💝", "㊙️","🍆🍑💦"];






// create an event listener for messages
bot.on('message', message => {
	// user_active.time_stamp(message.author);

 //  // console.log(message.content.toLowerCase());
  
  var is_admin = false;
  if( message.member){
    is_admin =  message.member.hasPermission("ADMINISTRATOR");
  }

  const msgLC = message.content.toLowerCase();


  if (msgLC === 'ping') {
    // send "pong" to the same channel.
    var msg = pingList[getPong(pingList.length-1)];
    message.channel.send(msg);
  }
  if (msgLC === 'reactt') {
    // send "pong" to the same channel.
    message.channel.send('react??')
    		.then(message => {
    			message.react('🇾')
					.then(() => message.react('❔'))
					.then(() => message.react('🇳'))
					.catch(() => console.error('One of the emojis failed to react.'));
    		});
  }

  if (is_admin && msgLC === 'need_chan_id') {
    // send "pong" to the same channel.
    var chan = message.channel.id;
    message.channel.send("Channel ID:"+chan);
  }

	


	
 

});




// log our bot in
try{
	console.log("My token is: "+token);
	bot.login(token);
}catch(err){
	console.log(err.message);
}
