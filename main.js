
// import the discord.js module
const Discord = require('discord.js');
const config = require('./config.js');


// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();
// const GCM = new Discord.GuildChannelManager();

// the token of your bot - https://discordapp.com/developers/applications/me
const token = config.token;

var fs = require('fs');

var my_invites={list:[]};

function getPong(max) {
  max = Math.floor(max);
  return Math.floor(Math.random() * (max + 1)); //The maximum is inclusive and the minimum is inclusive 
}

function createMyInvite(invite) {

  var inv = {
    code: "unk",
    channelName: "unk",
    inviterObj: {},
    maxUses: "unk",
    createdAt: "unk",
    inviteName: "unk",
    expiresAt: "unk",
    uses: "unk",
    usedBy: []

  };

  var newb = {
    username: invite.inviter.username,
    id: invite.inviter.id
  }

  inv.code=invite.code;
  inv.channelName=invite.guild.channels.resolve(invite.channel.id).toString();
  inv.inviterObj=newb;
  inv.maxUses=invite.maxUses;
  inv.createdAt=invite.createdAt;
  inv.inviteName=invite.inviteName;
  inv.expiresAt=invite.expiresAt;
  inv.uses=invite.uses;

  my_invites.list.push(inv);


  fs.writeFile('foo.json', JSON.stringify(my_invites), (err) => { if (err) throw err; });
}


function updateMyInvite(gmember) {

  var notfound=true;

  gmember.guild.fetchInvites()
    .then(invites => {
      console.log(`Fetched ${invites.size} invites`);
      invites
        .each(invite => {
          var i;
          for (i=0; i<my_invites.list.length; i++) {
            var inv = my_invites.list[i];
            // console.log("MOE_DEBUG code: "+inv.code+", "+invite.code);
            if (inv.code==invite.code) {
              // console.log("MOE_DEBUG uses: "+inv.uses+", "+invite.uses+", "+!isNaN(invite.uses));
              if (notfound && invite.uses && !isNaN(invite.uses) && inv.uses != invite.uses) {
                // console.log("MOE_DEBUG in: ");
                notfound=false;
                inv.uses = invite.uses;
                var newb = {
                  username: gmember.user.username,
                  id: gmember.id
                }
                inv.usedBy.push(newb);
              }
            }
            my_invites.list[i]=inv;

            fs.writeFile('foo.json', JSON.stringify(my_invites), (err) => { if (err) throw err; });
            // console.log("MOE_DEBUG: "+JSON.stringify(my_invites));
          }
        })
    })
    .catch(console.error);


}

// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
var NOTIFY_CHANNEL;
bot.on('ready', () => {
  console.log('I am ready!');
  NOTIFY_CHANNEL = bot.channels.fetch('741396405519908966'); // Channel to send notification
  console.log('My notify channel is: '+NOTIFY_CHANNEL);

  fs.readFile('foo.json', 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    my_invites = JSON.parse(data); //now it an object
    // obj.table.push({id: 2, square:3}); //add some data
    // json = JSON.stringify(obj); //convert it back to json
    // fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back 
  }});
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
			"roundtrip 24.7ms\n...lol not really", "🇾", "💖💞💝", "㊙️","🍆🍑💦","sup foo",
      "leave me alone, I'm sleeping"];






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

  createMyInvite(invite)
  

});


bot.on('inviteDelete', invite => {

  console.log("Invite was deleted: "+invite.code);


  var username="unknown";
  if(invite.inviter && invite.inviter.username){
    username=invite.inviter.username;
  }

  var inv_create_str = "";
  inv_create_str += "Invite deleted, code: "+invite.code;
  inv_create_str += "\n Inviter: "+username;
  inv_create_str += "\n Created at: "+invite.createdAt;
  inv_create_str += "\n Expires at: "+invite.expiresAt;
  inv_create_str += "\n Maximum amount of uses: "+invite.maxUses;
  inv_create_str += "\n Max Age: "+invite.maxAge;
  inv_create_str += "\n Member count: "+invite.memberCount;
  inv_create_str += "\n Uses: "+invite.uses;
  inv_create_str += "\n Channel: "+invite.channel;
  inv_create_str += "\n Channel name: "+invite.guild.channels.resolve(invite.channel.id).toString();



  NOTIFY_CHANNEL.then(function(chan) {
      // here you can use the result of promiseB
    console.log("Resolved Chan ID: "+chan.id); // "Success"
    chan.send(inv_create_str);
  });

});




bot.on('guildMemberAdd', gmember => {

  console.log("New Adventurer: "+gmember.user.username);

  updateMyInvite(gmember);

  

  

  // var inv_create_str = "";
  // inv_create_str += "Invite deleted, code: "+invite.code;
  // inv_create_str += "\n Inviter: "+invite.inviter.username;
  // inv_create_str += "\n Created at: "+invite.createdAt;
  // inv_create_str += "\n Expires at: "+invite.expiresAt;
  // inv_create_str += "\n Maximum amount of uses: "+invite.maxUses;
  // inv_create_str += "\n Channel: "+invite.channel;
  // inv_create_str += "\n Channel name: "+invite.guild.channels.resolve(invite.channel.id).toString();



  // NOTIFY_CHANNEL.then(function(chan) {
  //     // here you can use the result of promiseB
  //   console.log("Resolved Chan ID: "+chan.id); // "Success"
  //   chan.send(inv_create_str);
  // });

});





// log our bot in
try{
	console.log("My token is: "+token);
	bot.login(token);
}catch(err){
	console.log(err.message);
}
