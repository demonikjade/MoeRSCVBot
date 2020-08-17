// import the discord.js module
const Discord = require('discord.js');
const config = require('./config.js');
var MongoClient = require('mongodb').MongoClient;

const xpTrack = require('./xpTrack.js');
const invites = require('./invites.js'); // invites.processesMemberLeave();


// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

// the token of your bot - https://discordapp.com/developers/applications/me
const token = config.token;
var NOTIFY_CHANNEL;

function getPong(max) {
  max = Math.floor(max);
  return Math.floor(Math.random() * (max + 1)); //The maximum is inclusive and the minimum is inclusive 
}


bot.on('ready', () => {
  console.log('I am ready!');
  NOTIFY_CHANNEL = bot.channels.fetch('741396405519908966'); // Channel to send notification
  // console.log('My notify channel is: '+NOTIFY_CHANNEL);

});
bot.on('error', function(err){
    // handle the error safely
    console.log(err)
});


const pingList = ["pong","pong","pong","pong","pong","pong","pong","pong","pong","pong","pong","pong",
			"pong","pong","pong","pong","pong","pong","pong","pong","pong","pong","pong","pong",
			"stahp","i got u","wat","wat do", "cash me ousside","no plz no","ooo-wee","oof","big mood",
			"im here", "relax bruh", "chill dawg", "naw, that aint me", "raspberry sherbert","get rekt skrub",
			"roundtrip 24.7ms\n...lol not really", "🇾", "💖💞💝", "㊙️","sup foo", "moar shrimp bby plz",
      "leave me alone, I'm sleeping", "I swear to Guthix, I will high alch you",
      "Roses are red,\nviolets are blue,\ngimme dat rune,\nill trim 4 you",
      "Do you have 99 thieving?\nBecause you just stole my heart💙"];


// create an event listener for messages
bot.on('message', message => {
  
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
    message.channel.send('react??')
    		.then(message => {
    			message.react('🇾')
					.then(() => message.react('❔'))
					.then(() => message.react('🇳'))
					.catch(() => console.error('One of the emojis failed to react.'));
    		});
  }

  if (is_admin && msgLC === 'need_chan_id') {
    var chan = message.channel.id;
    message.channel.send("Channel ID:"+chan);
  }
 
  if (is_admin && msgLC === 'who_used_invite') {
    invites.messageInvitePairings(message);
  }

  if(msgLC === 'get_xp_fresh'){
    var retval = xpTrack.getWebsiteXp();
    message.channel.send(retval);
    // message.delete({ timeout: 5000 });
  }
});


bot.on('inviteCreate', invite => {

  console.log("My invite is: "+invite.code);

  var inv_create_str = "";
  inv_create_str += "Invite created, code: "+invite.code;
  inv_create_str += "\n Inviter: "+invite.inviter.username;
  inv_create_str += "\n Created at: "+invite.createdAt;
  inv_create_str += "\n Expires at: "+invite.expiresAt;
  inv_create_str += "\n Maximum amount of uses: "+invite.maxUses;
  inv_create_str += "\n Channel: "+invite.channel;
  inv_create_str += "\n Channel name: "+invite.guild.channels.resolve(invite.channel.id).toString();

  NOTIFY_CHANNEL.then(function(chan) {
      // here you can use the result of promiseB
    console.log("Resolved Chan ID: "+chan.id); // "Success"
    chan.send(inv_create_str);
  });

  // createMyInvite(invite);
  invites.processesCreateInvite(invite);

});

bot.on('inviteDelete', invite => {

  console.log("Invite was deleted: "+invite.code);     

  var username="unknown";
  if(invite.inviter && invite.inviter.username){
    username=invite.inviter.username;
  }

  var inv_create_str = "";
  inv_create_str += "Invite deleted, code: "+invite.code;
  inv_create_str += "\n Channel: "+invite.channel;
  inv_create_str += "\n Channel name: "+invite.guild.channels.resolve(invite.channel.id).toString();

  NOTIFY_CHANNEL.then(function(chan) {
      // here you can use the result of promiseB
    console.log("Resolved Chan ID: "+chan.id); // "Success"
    chan.send(inv_create_str);
  });

  invites.processesDeleteInvite(invite);

});

bot.on('guildMemberRemove', gmember => {

  invites.processesMemberLeave(gmember);

});
bot.on('guildMemberAdd', gmember => {

  // console.log("New Adventurer: "+gmember.user.username);

  invites.processesMemberAdded(gmember);

});




const announceList = [
  // {day:0, hour:0, minute:9, func: xpTrack.getWebsiteXp()},
  {day:0, hour:0, minute:9, func:"getWebsiteXp"}
];

setInterval(function() {
  var d = new Date();
  // NOTIFY_CHANNEL.send("DEBUG: Day is:"+d.getDay()
  //               +", Hour is:"+d.getHours()
  //               +" Minute is:"+d.getMinutes());

  for (const item of announceList) {
  // console.log(item);
    if(item.day == d.getDay() 
        && item.hour == d.getHours()
        && item.minute == d.getMinutes()){
        // ){

      if(item.func == "getWebsiteXp"){
        // xpTrack.getWebsiteXp();
      }

    }
  } 

}, 30 * 1000); // Check every minute

// log our bot in
try{
	console.log("My token is: "+token);
	bot.login(token);
}catch(err){
	console.log(err.message);
}
