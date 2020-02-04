const crypto = require('crypto');
const  ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient; 
const URL = 'mongodb://localhost:27017';
const DB_NAME = 'chatroom';
const IMAGES = "http://localhost:3000/userimages/";
const DEFAULT_IMG = "default.png";


/** Lookup the User object given the User Id
 * @param db: MongoDb object reference
 * @param ObjectID: Mongo object type
 * @param userid: Id of user to retrieve information for
 * @returns An object {username:m, image:m, imagepath:m}
 */
function lookupUserName(db, userid) {
  return new Promise((resolve, reject) => {
    if (userid == "" || userid == undefined){
      resolve("");
    } else {
      db.collection('users').findOne({_id: ObjectID(userid)},
      (err, doc) => { 
        if (doc == null){
          resolve("");
        } else {
          if (err){
            reject(err);
          } else {
            var image = doc.image;
            if (image=='' || image==undefined || image==null){
              image = DEFAULT_IMG;
            }

            resolve({
              username:doc.username, 
              image:doc.image,
              imagepath: IMAGES + image});
          }
        }

      });
    }


  });

}


/** Lookup the User Id for the User Name
 * @param db: MongoDb object reference
 * @param username: Id of user to retrieve information for
 * @returns An object {username:m, image:m, imagepath:m}
 */
function lookupUserId(db, username) {
  
  return new Promise((resolve, reject) => {
    if (username == "" || username == undefined){
      resolve("");
    } else {
      db.collection('users').findOne({username:username},
      (err, doc) => { 
        if (doc == null){
          resolve("");
        } else {
          if (err){
            resolve("");
          } else {
            var userid = doc._id.toString();
            resolve(userid);
          }
        }

      },
      (err) => { 
        resolve(""); 
      });
    }
  });

}


/** Lookup the User Id for the User Name. Note: If not working groupname search is case-sensitive.
 * @param db: MongoDb object reference
 * @param groupname: Name of group to find Id for
 * @returns An object {groupname:m}
 */
function lookupGroupId(db, groupname) {

  return new Promise((resolve, reject) => {
    if (groupname == "" || groupname == undefined){
      resolve("");
    } else {
      db.collection('groups').findOne({'groupname':groupname},
      (err, doc) => { 
        if (doc == null){
          resolve("");
        } else {
          if (err){
            resolve("");
          } else {
            var groupid = doc._id.toString();
            resolve(groupid);
          }
        }

      });
    }


  });

}


/** Lookup the User Id for the User Name. Note: If not working groupname search is case-sensitive.
 * @param db: MongoDb object reference
 * @param groupname: Name of group to find Id for
 * @returns An object {groupname:m}
 */
function lookupChannelId(db, channelname) {

  return new Promise((resolve, reject) => {
    if (channelname == "" || channelname == undefined){
      resolve("");
    } else {
      db.collection('groups').findOne({'channels.channelname':channelname},
      (err, doc) => { 
        if (doc == null){
          resolve("");
        } else {
          if (err){
            resolve("");
          } else {
            var channelid = '';
            for (var c=0; c < doc.channels.length; c++){
              if (doc.channels[c].channelname == channelname){
                channelid = doc.channels[c]._id;
              }
            }

            resolve(channelid);
          }
        }

      });
    }


  });

}

/** Password hash using sha512.
 * @param {string} password - List of required fields.
 * @param salt (string) - Data to be validated.
 */
function encodePassword(password, salt){
    var saltstring = salt;

    if (saltstring == ''){
      //- blank for new users
      saltstring = generateSalt();
    }

    var hash = crypto.createHmac('sha1', saltstring); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');

    return { salt:saltstring, passwordhash:value };

}


/** Generate a random alphanumeric string to be used in conjunction
 * with the User password for tighter password encryption.
 */
function generateSalt(){
  var result = '';
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charsLength = 5;

  for ( var i = 0; i < charsLength; i++ ) {
    var index = Math.floor(Math.random() * (chars.length - 1))
     result += chars.charAt(index);
  }
  
  return result;
}


function getMongoDb(){
  return new Promise((resolve, reject) => {
    MongoClient.connect(URL, {poolSize:10, useNewUrlParser: true, useUnifiedTopology: true},
      function(err, client) {
        const db = client.db(DB_NAME);
        resolve(db);
    });
  });
}  


//--- getDb_?? for testing purposes
// Functions retrieve a connection to MongoDb not passed by test.js

/**  */
async function getDb_lookupUserId(username) {
    var db = await getMongoDb();
    var userid = await lookupUserId(db,username);
    return userid;
}


async function getDb_lookupGroupId(groupname) {
  var db = await getMongoDb();
  var groupid = await lookupGroupId(db,groupname);
  return groupid;
}


async function getDb_lookupChannelId(channelname) {
  var db = await getMongoDb();
  var channelid = await lookupChannelId(db,channelname);
  return channelid;
}


module.exports.encodePassword = encodePassword;
module.exports.lookupUserName = lookupUserName;
module.exports.lookupUserId = lookupUserId;
module.exports.getDb_lookupUserId = getDb_lookupUserId;
module.exports.getDb_lookupGroupId = getDb_lookupGroupId;
module.exports.getDb_lookupChannelId = getDb_lookupChannelId;
