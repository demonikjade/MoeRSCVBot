
const config = require('./config.js');
var MongoClient = require('mongodb').MongoClient;


function getTimestamp(){
  const dt = new Date().getTime();
  return dt;
}

// should work on gmember and invite
function getTally(obj){
  var tally=0;
  if(obj.guild&&obj.guild.memberCount){
    tally = obj.guild.memberCount;
  }
  return tally;
}


/*
When invites are created, they are sent to database.
Update amount of guild members upon invite creation.
*/
function processesCreateInvite(invite){
 
  // Convert Discord.jr invite object into our invite object. 
  var inv = {
    code: "unk",
    channelName: "unk",
    inviterObj: {},
    maxUses: "unk",
    createdAt: "unk",
    expiresAt: "unk",
    uses: "unk",
    usedBy: [],
    timestamp: 0,
    deleted: false
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
  inv.expiresAt=invite.expiresAt;
  inv.uses=invite.uses;
  inv.timestamp = getTimestamp();

  // Send our invite object to the database.
  MongoClient.connect(config.DB, function(err, db) {
    if (err) throw err;
    var dbo = db.db("MoeRSCVBotDB");
    try {
      dbo.collection("invites").insertOne( inv );
    } catch (e) {
      print (e);
    };

    var tally=getTally(invite);
    var gmemberTally = {
      timestamp: getTimestamp(),
      tally: tally
    };
    try {
      dbo.collection("gmemberTallies").insertOne( gmemberTally );
    } catch (e) {
      print (e);
    };
  });
}

/*
If Invites are deleted, check for change in uses in existing invites.
If uses don't match,then the deleted invite is sent to database, and 
paired with the member who joined at closest matched timestamp.
*/
function processesDeleteInvite(invite){

  //Pull our database object using deleted code.
  MongoClient.connect(config.DB, function(err, db) {
    if (err) throw err;
    var dbo = db.db("MoeRSCVBotDB");

    //Check if uses match, if no match: check for member add nearest similar timestamp of deleted invite.
    try {
      dbo.collection("invites").updateOne(
        { "code" : invite.code },
        { $set: { "timestamp": getTimestamp() , "deleted": true } }
      );
    } catch (e) {
      print(e);
    }

    //If no member add around timestamp of deleted invite, ignore. 
    db.close();
  });  
}

/*
When a member leaves the guild, the amount of guild members is updated
and sent to database.
*/
function processesMemberLeave(gmember){

  //Update the number of guild members.
  MongoClient.connect(config.DB, function(err, db) {
    if (err) throw err;
    var dbo = db.db("MoeRSCVBotDB");
    var tally=getTally(gmember);
    var gmemberTally = {
      timestamp: getTimestamp(),
      tally: tally
    };
    dbo.collection("gmemberTallies").insertOne(gmemberTally, function(err, res) {
      if (err) throw err;
      console.log("1 gmemberTally inserted");
      db.close();
    });
  });
}

/*
When a member joins the guild, the amount of guild members is updated
and sent to database. Member added will be paired with uses changed. 
If no change in uses, it will be paired with the closest matched deleted
invite based on timestamp. (Along with the creator of this invite.)
*/
function processesMemberAdded(gmember){

  //Get all invites from Discord, and check uses against database invites/uses. 
  var notfound=true;
  var dt = getTimestamp(); // hoping that the add event is real close to NOW
  var closestInv = {code: "nope",uses:-1,timestamp:9999999999, usedBy: []};
  var user = gmember.user;
  MongoClient.connect(config.DB, function(err, db) {
    if (err) throw err;
    var dbo = db.db("MoeRSCVBotDB");
    dbo.collection("invites").find({}).toArray(function(err, result) {
      if (err) throw err;
      gmember.guild.fetchInvites().then(invites => {invites.each(invite => {
        var i;
        for (i=0; i<result.length; i++) {
          var inv = result[i];
          if (inv.code==invite.code && notfound && invite.uses && !isNaN(invite.uses) && inv.uses != invite.uses) {
            //If difference is found, pair member added to invite and inviter. 
            notfound=false; //cuz we found one where uses dont match
            if(user&&user.username&&user.id){
              var newb = {
                username: user.username,
                id: user.id
              }
              inv.usedBy.push(newb);
            }
            closestInv = inv;
          }
          if(inv.deleted && inv.timestamp && closestInv.timestamp > Math.abs(inv.timestamp - dt)){
            // closest is big, meaning temporally far away
            closestInv = inv;
          }
        }
      }) }); //end guild fetch invites
      if(notfound){
        //If no difference in uses, compare timestamp of member added to deleted invites in database.
        if(user&&user.username&&user.id){
          var newb = {
            username: user.username,
            id: user.id
          }
          closestInv.usedBy.push(newb);
        }
      }
      console.log("JG_DEBUG: found closestInv: "+closestInv.code+" for user: "+user.username);
      //finally, whatever we found, update
      try {
        dbo.collection("invites").updateOne({"code": closestInv.code},
          {$set: {"uses": closestInv.uses, "usedBy": closestInv.usedBy}}
        );
      } catch (e) {
        print(e);
      } finally {
        db.close();
      }
    }); // end dbo find all
  }); // end client
}


function messageInvitePairings(message){
  MongoClient.connect(config.DB, function(err, db) {
    if (err) throw err;
    var dbo = db.db("MoeRSCVBotDB");

    dbo.collection("invites").find({}).toArray(function(err, result) {
      if (err) throw err;
      var i;
      for (i=0; i<result.length; i++) {
        var inv = result[i];
        // console.log("MOE_DEBUG username: "+inv.inviterObj);
         
        if (inv.inviterObj && inv.inviterObj.username
              && inv.uses > 0){

          var msg = "";
          msg += "Invite code: "+inv.code;
          msg += "\nInviter: "+inv.inviterObj.username;
          msg += "\nInvitees: ";
          var j;
          for (j=0; j<inv.usedBy.length; j++) {
            var newb = inv.usedBy[j];
            if (newb.username) {
              msg += newb.username+", ";
            }
          }
          message.channel.send(msg);
        }
      }

      db.close();
    });
  });
}

module.exports = {
  processesCreateInvite : processesCreateInvite,
  processesDeleteInvite : processesDeleteInvite,
  processesMemberLeave : processesMemberLeave,
  processesMemberAdded : processesMemberAdded,
  processesMemberAdded : processesMemberAdded,
  messageInvitePairings : messageInvitePairings,
}