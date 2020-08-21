

const config = require('./config.js');
var MongoClient = require('mongodb').MongoClient;

const crypto = require("crypto");


function processesNewMessage(message, is_admin=false){
  var server = message.guild.id;
  var author = message.author.username;
  var text = message.toString().trim();
  var res = text.split(" ");
  var quote = text.split(/[\"\'"]+/);
  var adminCmd = false;

  var mentions = message.mentions.users.array();
  // mentions.each(user => console.log(user.username));

  var retval = "your use of the `!alt` command did not match expected pattern";

  retval = "Machine vision: "+res.join("|")+" and "+quote.join("|")+"\n\n";
  retval += "mentions: "+mentions.length+", quotes: "+quote.length+" \n";
  // mentions.each(user => {
  //   retval += user.username+" ";
  // });

  // !alts "moe" "moe bro" "slow moe"    // pairs my alts in a group
  // res = ["!alt", ""moe"", ...]
  // quote = ["!alts ","moe"," ","moe bro"," ","slow moe"]

  if(res[1] === "admin"){
    // this is an admin command
    adminCmd = true;
  }else{
    
  }

  // using quote[] will ignore wheather or not admin command was present
  if(quote.length + mentions.length == 3){
    // this is a show request for ign quote[1]
    retval += showOneIGN(retval, server, quote[1], mentions, is_admin, adminCmd);
  }else if(quote.length + mentions.length > 3){
    // some combo of quotes and mentions has 2 or more igns to parse
    retval += insertIGNs(retval, server, quote, mentions, is_admin, adminCmd);
  }else if(quote.length + mentions.length == 1){
    // must be an admin show command
    retval += showAdmin(retval, server, is_admin, adminCmd);
  }


  return retval;
}


// { tags: ["red", "blank"] }    // finds red && blank only, in that order
// { tags: { $all: ["red", "blank"] } }     // finds any that contains red and blank , in any order
// { tags: "red" }   // finds any that contains "red"
// { quantity: { $in: [20, 50] } }  // will find any match of one or the other

/*
{
  server:  12345678987654321
  igns: ["asdf","werty","sdfghj"]
  discords: ["1234567890987654321", "65434567898765"]
  published: false
}
*/

function showOneIGN(retval, server, name, mentions, is_admin, adminCmd){
  var addretval = "JG_DEBUG: in showOneIGN";
  var quote = [];
  quote.push(name);
  var theGroup = getGroup(server, quote, mentions);

  return addretval;
}

function insertIGNs(retval, server, quote, mentions, is_admin, adminCmd){
  var addretval = "JG_DEBUG: in insertIGNs";
  const madeID = makeID();

  var nameArray = sanitizeQuote(quote);
  var disArray = sanitizeMentions(mentions);

  let myPromise = new Promise(function(resolve, reject) {    
    // var theGroup = await getGroup(server, quote, mentions);
    let theGroup = getGroup(server, quote, mentions);
    resolve(theGroup);
  });

  myPromise.then(theGroup => {
    // now that we have group, add anything missing
    console.log("JG_DEBUG: theGroup reutrned: "+theGroup);
    var i;
    var nameAdd = deleteDupes(theGroup.igns, nameArray);
    var disAdd = deleteDupes(theGroup.discords, disArray);
    
    for(i=0;i<nameArray;i++){theGroup.igns.push(nameArray[i]);}
    for(i=0;i<disArray;i++){theGroup.discords.push(disArray[i]);}

    MongoClient.connect(config.DB, function(err, db) {
      if (err) throw err;
      var dbo = db.db("MoeRSCVBotDB");
      if(theGroup.id == 123){  // if no id, its new
        theGroup.id = madeID;
        dbo.collection("alts").insertOne(theGroup, function(err, res) {
          if (err) throw err;
          console.log("1 theGroup insert new");
          db.close();
          return addretval+nameArray+disArray+" ...\n";
        });
      }else{   // if id, then its existing
        dbo.collection("alts").updateOne({"id": theGroup.id},
            {$set: {"igns": theGroup.igns, "discords": theGroup.discords}}, function(err, res) {
          if (err) throw err;
          console.log("1 theGroup update");
          db.close();
          return addretval+nameArray+disArray+" ...\n";
        });
      }
      
    });
  }).catch(err =>{console.log(err)});    

}

function showAdmin(retval, server, is_admin, adminCmd){
  var addretval = "JG_DEBUG: in showAdmin";

  return addretval;
}


function displayGroup(group){
  var retval = "JG_GROUP:  parse group and return";

  return retval;
}


function readFile(file, encoding) {
  
}

async function getGroup(server="failure", quote=[], mentions=[]){
  return new Promise(function(resolve, reject) {
    const dt = new Date().getTime();
    var theGroup = {
      id: 123,
      timestamp: dt,
      igns: [],
      discords: [],
      published: false
    };

    var query;
    var nameArray = sanitizeQuote(quote);
    var disArray = sanitizeMentions(mentions);

    query = {igns: { $in: nameArray }, 
            discords: { $in: disArray }, 
            server: server};

    MongoClient.connect(config.DB, function(err, db) {
      if (err) throw err;
      var dbo = db.db("MoeRSCVBotDB");
      try {
        dbo.collection("alts").findOne(query).then(group => {
          console.log("JG_DEBUG: found group? "+group+" or "+theGroup.id);
          if(group&&group.id){
            console.log("JG_DEBUG: getGroup returning: "+group.id);
            resolve(group);
          }else{
            console.log("JG_DEBUG: getGroup returning: "+theGroup.id);
            resolve(theGroup);
          }
        });
      } catch (e) {
        print (e);
      }
    });
  })
}

function sanitizeQuote(quote){
  var sani = [];
  for(i=0;i<quote.length;i++){
    var q = quote[i].trim;
    if(q&&q.length>0){
      sani.push(q);
    }
  }
  return sani;
}

function sanitizeMentions(mentions){
  var sani = [];
  if(mentions&&mentions[0]){
    var i;
    for(i=0;i<mentions.length;i++){
      var mention = mentions[i];
      sani.push(mention.id);
    }
  }
  return sani;
}

function deleteDupes(source, toPrune){
  var i, j;
  if(source&&source.length&&toPrune&&toPrune.length){
    for(i=0;i<toPrune.length;i++){
      var prn = toPrune[i];
      for(j=0;j<source.length;j++){
        var src = source[j];
        if(prn === src){
          // this exists, remove from name cuz its in there
          toPrune.splice(i, 1);
        }
      }
    }
  }
  return toPrune;
}


function makeID(size=7){
  const id = crypto.randomBytes(16).toString("hex");
  return id.slice(id.length - size);
}

module.exports = {
  processesNewMessage : processesNewMessage,
}

/*
!alts "me" "mine" "meeto"    
        // pairs my alts in a group

!alts @MineName "mine"   
        // pairs these in a group too , only my group tho

!alts "meeto"    
        // displays meeto , discord username, and known alts 
        // all people can 'see' this 
        // doesnt work on unpublished group

!alts admin "derp" "face"  @DerpFace  
        // does pair for not-my group

!alts admin "derp"  
        // shows unpublished group for 'derp'

!alts admin all  
        // shows all the records

!alts admin pub 
        // shows all the published records

!alts admin unpub 
        // shows all the unpublished records
*/