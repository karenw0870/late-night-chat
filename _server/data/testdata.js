var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;

let User = require('../classes/user').User;
let Group = require('../classes/group').Group;
let GroupAssist = require('../classes/groupassist').GroupAssist;
let Channel = require('../classes/channel').Channel;
let ChannelMember = require('../classes/member').ChannelMember;

const fh = require('../functions/filehandler');
let encodePassword = require('../functions/global').encodePassword;
let lookupUserId = require('../functions/global').lookupUserId;

// RUN >>> node data/testdata
addTestData();

async function addTestData() {

  MongoClient.connect(url, {poolSize:10, useNewUrlParser: true, useUnifiedTopology: true}, 
    function(err, client) {
    if (err) throw err;
    let db = client.db("chatroom");

    // * * * PROMISE HANDLER * * *
    var handlePromises = async () => {
      console.log('---------------------------------------------------------------------------------------');
      console.log('### Adding test data');
      var ok = await (DeleteUsers());
      var ok2 = await (CreateUsers());
      var ok3 = await (DeleteGroups());
      var ok4 = await (CreateGroups());
      console.log('     >>> Test data entered');
      return true;
    } 

    var DeleteUsers = async () => {
      db.collection('users').deleteMany(
        (err,doc)=>{
          return true;
        });
    }

    var DeleteGroups = async () => {
      db.collection('groups').deleteMany(
        (err,doc)=>{
          return true;
        });
    }

    // * * * USERS * * *
    var CreateUsers = async () => {
      return new Promise((resolve, reject) => {
        fh.getUsersFromFile(function(users){
          handleUsers(users).then(function(result) {
            resolve(true);
          });
        });
      });
    }

    var handleUsers = async (users) => {
      for (var u=0; u < users.length; u++){
        var security = await getPassword(users[u].password);
        await addUser(users[u],security);
      } 
      return true;
    }

    var getPassword = async (password) => {
      var security = await encodePassword(password, '');
      return security;
    };

    var addUser = async (user,security) => {
      return new Promise((resolve, reject) => {
        var userColl = db.collection('users');
      
        userColl.findOne({username:user.username}, 
          (err, doc) => {
            if (doc == null) {
              newuser = new User(
                user.username,
                user.email,
                user.securitylevel,
                user.image,
                security.salt,
                security.passwordhash,
                user.password
              );
  
              userColl.insertOne(newuser, 
                (err,doc) => {
                  resolve(true);
                });
            } 
            newuser = null;
        });

      });
    };

    // * * * ADD GROUPS * * * 
    var CreateGroups = async () => {
      return new Promise((resolve, reject) => {
        fh.getGroupsFromFile(function(groups){
          handleGroups(groups).then(function(result) {
            resolve(true);
          });
        }); 
      });

    }

    var handleGroups = async (groups) => {
      for (var g=0; g < groups.length; g++){
        var adminid = await lookupUserId(db,groups[g].groupadmin); 
        await addGroup(groups[g], adminid);
      } 
      return true;
    }

    var addGroup = async (group, adminid) => {
      return new Promise((resolve, reject) => {
        var groupColl = db.collection('groups');
        var newgroup = new Group(
          group.groupname,
          adminid,
          group.description
        );
  
        groupColl.findOne({groupname:group.groupname},
          (err, doc) => {
            if (doc == null) {
              groupColl.insertOne(newgroup,
                (err,doc)=>{
                  if (doc == null){
                    return 0;
                  } else {
                    handleAssists(doc.insertedId,group.groupassists);
                    handleChannels(doc.insertedId,group.channels);
                    resolve(true);
                  }
                });
            } else {
              resolve(false);
            }
          });
      });

    
    };

    var handleAssists = async (insertedGroupId,assists) => {
      return new Promise((resolve, reject) => {
        for (var a=0; a < assists.length; a++){
          addGroupAssist(assists[a],insertedGroupId);
        }
        resolve(true);
      });
    }

    var addGroupAssist = async (groupassist, insertedGroupId) => {
      var userid = await lookupUserId(db, groupassist.username);

      return new Promise((resolve, reject) => {
        var groupColl = db.collection('groups');
        var groupid = ObjectID(insertedGroupId);
        var newassist = new GroupAssist(userid);
    
        groupColl.updateOne({_id:groupid},
          {$push: {groupassists: newassist}},
          (err,doc) => {
            return(true);
        });
      });
    };

    var handleChannels = async (insertGroupId,channels) => {
      return new Promise((resolve, reject) => {
        for (var c=0; c < channels.length; c++){
          addChannel(channels[c],insertGroupId);
        }
        resolve(true);
      });
    }

    var addChannel = async (channel, insertedGroupId) => {
      return new Promise((resolve, reject) => {
        var groupColl = db.collection('groups');
        var groupid = ObjectID(insertedGroupId);
        var newchannel = new Channel(channel.channelname);
  
        //-- Find the group doc --
        groupColl.updateOne({_id:groupid},
          {$push: {channels: newchannel}},
          (err,doc) => {
            handleMembers(newchannel._id, channel.members);
            resolve(true);
        });
      });
    };

    var handleMembers = async (insertedChannelId,members) => {
      return new Promise((resolve, reject) => {
        for (var m=0; m < members.length; m++){
          addMember(members[m],insertedChannelId);
        }
        resolve(true);
      });


    }

    var addMember = async (member, insertedChannelId) => {
      var userid = await lookupUserId(db, member.username);

      return new Promise((resolve, reject) => {
        var groupColl = db.collection('groups');  
        var newmember = new ChannelMember(userid);
          
        groupColl.updateOne({'channels._id':ObjectID(insertedChannelId)},
          {$push: {'channels.$.members':newmember}},
          (err,doc) => {
            resolve(true);
        });
      });
    };

    //-- CALL HANDLER & SEND
    handlePromises().then(function(result) {
      return process.kill(process.pid)
    });

}); // end MongoDb

}

