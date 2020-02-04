const global = require('../functions/global');
let Channel = require('../classes/channel');
let Member = require('../classes/member');
let Message = require('../classes/message');


module.exports = {

  connect: function(db, ObjectID, io){
    //-- Channels Array
    // {channel:channelid, users:[{socket:socket.id, name:m, image:m}]}

    let channels = [];
    const COLL = db.collection('groups');
    const chat = io.of('/chat');
  
    chat.on('connection', (socket) => {
      
      // -- JOIN CHANNEL ---
      // @emits: 'joinedChannel': new channel object
      // @emits: 'currusers':  User object array {socket:socket.id, name:m, image:m}
      // @emits: 'notice': string to advise of new user
      socket.on('joinChannel', (channelid, username, userimage) => {
        var groupid = '';

        socket.join(channelid, () => {
          var getChannelDoc = async () => {
            return new Promise((resolve, reject) => {
              COLL.findOne({'channels._id': ObjectID(channelid)},
                (err, doc) => { 
                  groupid = doc._id;
                  for (var c=0; c < doc.channels.length; c++){
                    if (doc.channels[c]._id == channelid){
                      resolve(doc.channels[c]);
                      break;
                    }
                  }
              });
              
            });
          };
      
          //Async Promise Handler
          var handlePromises = async () => {
            var channelColl = await (getChannelDoc());
            var channel = await getSingleChannel(db, ObjectID, channelColl);
            channel.groupid = groupid;
            return channel;
          }

          var setChannels = () => {
            var newobject = {socket:socket.id,name:username,image:userimage};

            //-- Check if channel in array
            var foundChannel = channels.find(c => c.channel == channelid);
            if (foundChannel == undefined){
              channels.push({channel:channelid, users:[newobject]});

            } else {
              var foundUser = foundChannel.users.find(u => u.name == username);
              if (foundUser == undefined){
                foundChannel.users.unshift(newobject);
              }
            }

            var sendchannel = channels.find(c => c.channel == channelid);
            chat.in(channelid).emit('currusers', sendchannel.users);
            chat.in(channelid).emit('notice', username + ' has joined the chat');
          }
      
          //Handler & Send
          handlePromises().then(function(result) {
            setChannels();
            return chat.in(channelid).emit("joinedChannel", result);
          });
        });
      });


      // -- RECEIVE MESSAGE --
      // @emits: 'message': new message object Message_CS
      socket.on('message', (channelid, userid, username, userimage, message) => {
        //-- Save the message 
        var dbmsg = new Message.Message(userid, message);
    
        COLL.updateOne({'channels._id':ObjectID(channelid)},
          {$push: {'channels.$.messages':dbmsg}},
          ()=>{
            var newmsg = new Message.Message_CS(
              dbmsg._id,
              userid,
              username,
              userimage,
              message
            )
            chat.to(channelid).emit('message', newmsg);
            chat.in(channelid).emit('notice', username + ' messaged');
        }); 

      });

  
      // -- LEAVE CHANNEL --
      // @emits: 'currusers': User object array {socket:socket.id,name:m,image:m}
      socket.on('leaveChannel', (channelid, username) => {
        //--Remove user from array
        for (var j=0; j < channels.length; j++){
          if(channels[j].channel == channelid){
            var users = channels[j].users;

            for (var u=0; u < users.length; u++){
              if (users[u].name == username){
                users.splice(u, 1);
                break;
              }
            }
          }
        }

        //--Check if all users are removed
        var sendchannel = channels.find(c => c.channel == channelid);
        if (sendchannel != undefined){
          chat.in(channelid).emit('currusers', sendchannel.users);
        } else {
          chat.in(channelid).emit('currusers', []);
        }
        
        chat.in(channelid).emit('notice', username + ' has left the chat');
      });
  

      // -- DISCONNECT --
      // Find disconnected user by socket.id and remove from arrays
      // @emits: 'currusers': User object array {socket:socket.id,name:m,image:m}
      socket.on('disconnect', () => {
        chat.emit('disconnect');

        var channelid = "";
        // {channel:channelid, users:[{socket:socket.id, name:m, image:m}]}

        for (var c=0; c < channels.length; c++){
          var users = channels[c].users;
          for (var u=0; u < users.length; u++){
            if (users[u].socket == socket.id){
              channelid = channels[c].channel;
              chat.in(channelid).emit('notice', users[u].name + ' has left the chat');
              users.splice(u, 1);
              break;
            }
          }
        }
  
        //--Check if all users are removed
        var sendchannel = channels.find(c => c.channel == channelid);
        if (sendchannel != undefined){
          chat.in(channelid).emit('currusers', sendchannel.users);
        } else {
          chat.in(channelid).emit('currusers', []);
        }

      });
  
    });
  }

}


//--- PRIVATE FUNCTIONS ---

/** Get the Channel object and channels from the specified Gorup Document
 * @param db: Reference to MongoDb
 * @param ObjectID: Reference to ObjectID of MongoDb
 * @param curruserid: Current user Id or User Id from User record
 * @returns Channel object
 */
function getSingleChannel(db, ObjectID, channel){
  var getChannelArray = async () => {

    var newchannel = new Channel.Channel_CS(
      channel._id, 
      channel.channelname
    );
    
    newchannel.members = await getMembers();
    newchannel.messages = await getMessages();
    return newchannel;
  };

  var addgroupinfo = async(newchannel) => {
    db.collection('groups').findOne({'channels._id':channel._id},
    (err,doc) =>{
      console.log('DOC:**');
      newchannel.groupid = doc._id;
      newchannel.groupadminid = doc.groupadminid;
      // return newchannel;
    });

    return newchannel;
  }

  var getMembers = async () => {
    if (channel.members == undefined) return [];
    var members = [];

    for (var m=0; m < channel.members.length; m++){
      var memberdoc = channel.members[m];

      var userdoc = await (global.lookupUserName(db, memberdoc.userid));
      var username = userdoc.username;
      var userimage = userdoc.imagepath;

      var member = new Member.ChannelMember_CS(
        memberdoc._id,
        memberdoc.userid,
        username,
        userimage
      )

      members.push(member);
    }

    return members;
  };

  var getMessages = async () => {
    if (channel.messages == undefined) return [];
    var messages = [];

    // Display in reverse order - last message first
    for (var m=channel.messages.length-1; m > -1 ; m--){
      var messagedoc = channel.messages[m];

      var userdoc = await (global.lookupUserName(db, messagedoc.userid));
      var username = userdoc.username;
      var userimage = userdoc.imagepath;

      var message = new Message.Message_CS(
        messagedoc._id,
        messagedoc.userid,
        username,
        userimage,
        messagedoc.content
      )

      messages.push(message);
    }

    return messages;
  };

  return new Promise((resolve, reject) => {
    getChannelArray()
      .then(function(result) {
        resolve(result);
    });
  });
}