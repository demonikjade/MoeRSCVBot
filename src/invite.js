

/*
When invites are created, they are sent to database.
Update amount of guild members upon invite creation.
*/
function processesCreateInvite(){
 
  // Convert Discord.jr invite object into our invite object. 

  // Send our invite object to the database.

  // Update the number of guild members.

}

/*
If Invites are deleted, check for change in uses in existing invites.
If uses don't match,then the deleted invite is sent to database, and 
paired with the member who joined at closest matched timestamp.
*/
function processesDeleteInvite(){

  //Pull our database object using deleted code.

  //Check if uses match, if no match: check for member add nearest similar timestamp of deleted invite.

  //If no member add around timestamp of deleted invite, ignore. 
 
}

/*
When a member leaves the guild, the amount of guild members is updated
and sent to database.
*/
function processesMemberLeave(){

  //Update the number of guild members.
 
}

/*
When a member joins the guild, the amount of guild members is updated
and sent to database. Member added will be paired with uses changed. 
If no change in uses, it will be paired with the closest matched deleted
invite based on timestamp. (Along with the creator of this invite.)
*/

function processesMemberAdded(){

  //Get all invites from Discord, and check uses against database invites/uses. 

  //If difference is found, pair member added to invite and inviter. 

  //If no difference in uses, compare timestamp of member added to deleted invites in database.
    //If match found, pair this member added to the matched invite (Inviter & Invite Code)
 
}



module.exports = {
  processesCreateInvite : processesCreateInvite,
  processesDeleteInvite : processesDeleteInvite,
  processesMemberLeave : processesMemberLeave,
  processesMemberAdded : processesMemberAdded,
}