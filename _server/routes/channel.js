
const global = require('../functions/global');
let Channel = require('../classes/channel');
let Member = require('../classes/member');
let Message = require('../classes/message');

module.exports = function(db, app, ObjectID) {

  const COLL = db.collection('groups');
  
  /** UPDATE the specified channel using the given id and object methods
   * @request A channel object
   * @response A new object or the updated object
   */
  app.post('/channel/create', function(req, res){
    
    var groupid = new ObjectID(req.body.groupid);
    var newchannel = new Channel.Channel(req.body.channelname);

    //-- Find the group doc --
    COLL.updateOne({_id:groupid},
      {$push: {channels: newchannel}},
      ()=>{
          res.send({'ok':true,'result':newchannel._id});
    });


  });


  /** GET FOR UPDATE the specified channel
   * @request A group object 
   * @response Group object
   */
  app.get('/channel/update/:id', function(req, res){
    if (!req.body) return res.sendStatus(400);

    var channelid = req.params['id'];
    var groupid = req.params['groupid'];
    var objectid = new ObjectID(channelid);

    //-- DECLARE PROMISES
    var getCollection = () => {
      return new Promise((resolve, reject) => {
        COLL.findOne({'channels._id':objectid},
          (err, doc) => { 
            resolve(doc); 
        });
        
      });
    };

    var getChannel = async (doc) => {
      var channel = new Channel.Channel_CS(
        doc._id, 
        doc.channelname);
      channel.groupid = groupid;
      
      return channel;
    };

    //-- ASYNC PROMISE HANDLER
    var handlePromises = async () => {
      var channelCollection = await (getCollection());
      var channel = await getChannel(channelCollection);
      return channel;
    }

    //-- CALL HANDLER & SEND
    handlePromises().then(function(result) {
      res.send({'channel':result});
    });

  });
  
  
  /** UPDATE the specified group using the given id and object methods
   * @request A group object
   * @response A new object or the updated object
   */
  app.put('/channel/update', function(req, res){
    if (!req.body) return res.sendStatus(400);

    var channelid = req.body.id;
    var channelname = req.body.channelname;
    var objectid = ObjectID(channelid);

    COLL.updateOne({ "channels._id": objectid }, 
        { "$set": { "channels.$.channelname": channelname }},
      ()=>{
        res.send({'ok':true, 'result':channelid});
      });

  });



  /** DETAIL of the specified channel record ????SOCKETS
   * @request id Channel Id
   * @returns response Channel object
   */
  // app.get('/channel-DELETE-SOCKETS/detail/:id', function(req, res){
  //   if (!req.body) return res.sendStatus(400);

  //   var channelid = req.params['id'];

  //   var getCollection = async () => {
  //     return new Promise((resolve, reject) => {
  //       COLL.findOne({'channels._id': ObjectID(channelid)},
  //         (err, doc) => { 
  //           resolve(doc.channels[0]);
  //           // for (var c=0; c < doc.channels.length; c++){
  //           //   if (doc.channels[c]._id == channelid){
  //           //     resolve(doc.channels[c]);
  //           //     break;
  //           //   }
  //           // }
  //       });
        
  //     });
  //   };

  //   //-- ASYNC PROMISE HANDLER
  //   var handlePromises = async () => {
  //     var channelColl = await (getCollection());
  //     var channel = await getSingleChannel(
  //       db, ObjectID, channelColl);
  //     return channel;
  //   }

  //   //-- CALL HANDLER & SEND
  //   handlePromises().then(function(result) {
  //     res.send({'channel':result});
  //   });
  // });

  
  /** DELETE the specified group assist object
   * @request id-Channel Id; groupid
   * @returns response boolean - true is deleted otherwise false
   */
  app.delete('/channel/delete', function(req, res){
    if (!req.body) return res.sendStatus(400);

    var channelid = ObjectID(req.query['id']);
    var groupid = ObjectID(req.query['groupid']);

    COLL.updateOne({_id:groupid},
      {$pull: {'channels': {_id: channelid }}},
      (err, result)=>{
        res.send({ok:true, result:result.modifiedCount, error:''});
    });
  });  
    

  /** UPDATE MEMBER the specified channel member elment using the given id and object methods
   * @request A channel member object
   * @response A new object or the updated object
   */
  app.post('/member/create', function(req, res){

    var channelid = req.body.channelid;
    var newmember = new Member.ChannelMember(req.body.userid);

    COLL.updateOne({'channels._id':ObjectID(channelid)},
      {$push: {'channels.$.members':newmember}},
      ()=>{
        res.send({'ok':true, 'result':newmember._id});
    });

  });


  /** DELETE MEMBER the specified channel
   * @request id Channel Id
   * @returns response boolean - true is deleted otherwise false
   */
  app.delete('/member/delete/:id', function(req, res){
    if (!req.body) return res.sendStatus(400);

    var memberid =req.params['id'];

    COLL.updateOne({'channels.members._id':ObjectID(memberid)},
      {$pull: {'channels.$.members': {_id:  ObjectID(memberid) }}},
      (err, result)=>{
        res.send({ok:true, error:''});
    });
  });

}



//--- PRIVATE FUNCTIONS ---

// /** Get the Channel object and channels from the specified Gorup Document
//  * @param db: Reference to MongoDb
//  * @param ObjectID: Reference to ObjectID of MongoDb
//  * @param curruserid: Current user Id or User Id from User record
//  * @returns Channel object
//  */
// function getSingleChannel(db, ObjectID, channel){
//   var getChannelArray = async () => {

//     var newchannel = new Channel.Channel_CS(
//       channel._id, 
//       channel.channelname
//     );

//     newchannel.members = await getMembers();
//     newchannel.messages = await getMessages();
//     return newchannel;
//   };

//   var addgroupinfo = async(newchannel) => {
//     db.collection('groups').findOne({'channels._id':channel._id},
//     (err,doc) =>{
//       newchannel.groupid = doc._id;
//       newchannel.groupadminid = doc.groupadminid;
//       console.log('ADDING:',newchannel)
//       return newchannel;
//     });
//   }

//   var getMembers = async () => {
//     if (channel.members == undefined) return [];
//     var members = [];

//     for (var m=0; m < channel.members.length; m++){
//       var memberdoc = channel.members[m];

//       var userdoc = await (global.lookupUserName(db, memberdoc.userid));
//       var username = userdoc.username;
//       var userimage = userdoc.imagepath;

//       var member = new Member.ChannelMember_CS(
//         memberdoc._id,
//         memberdoc.userid,
//         username,
//         userimage
//       )

//       members.push(member);
//     }

//     return members;
//   };

//   var getMessages = async () => {
//     if (channel.messages == undefined) return [];
//     var messages = [];

//     for (var m=0; m < channel.messages.length; m++){
//       var messagedoc = channel.messages[m];

//       var userdoc = await (global.lookupUserName(db, memberdoc.userid));
//       var username = userdoc.username;
//       var userimage = userdoc.imagepath;

//       var message = new Message.Message_CS(
//         messagedoc._id,
//         messagedoc.userid,
//         username,
//         userimage,
//         messagedoc.content
//       )

//       messages.push(message);
//     }

//     return messages;
//   };

//   return new Promise((resolve, reject) => {
//     getChannelArray()
//       .then(addgroupinfo(result))
//       .then(function(result) {
//         console.log('RESOLVE:',result);
//         resolve(result);
//       });
//   });
// }
