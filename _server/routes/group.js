
const global = require('../functions/global');
const user = require('../routes/user');
let Group = require('../classes/group');
let GroupAssist = require('../classes/groupassist');
let Channel = require('../classes/channel');


//--- API CALL FOR GROUPS ---

module.exports = function(db, app, ObjectID) {

  const COLL = db.collection('groups');

  /** CREATE a new group with values from the given group object
   * @request A group object
   * @response _id of saved Group
   */
  app.post('/group/create', function(req, res){
    if (!req.body) return res.sendStatus(400);

    var group = req.body;

    var newgroup = new Group.Group(
      group.groupname,
      group.groupadminid,
      group.description
    );

    COLL.findOne({groupname:group.groupname},
      (err, doc) => {
        if (doc == null){
          COLL.insertOne(newgroup, 
            (err, dbresult) => {
              res.send({'ok':true, 'result':dbresult.insertedId, 'error':err});
          });
        } else {
          res.send({'ok':false, 'result':'', 'error':'Group has already been entered'});
        }
      });

  });


  /** GET FOR UPDATE the specified group
   * @request A group object 
   * @response Group object
   */
  app.get('/group/update/:id', function(req, res){
    if (!req.body) return res.sendStatus(400);

    var groupid = req.params['id'];
    var objectid = ObjectID(groupid);

    //-- DECLARE PROMISES
    var getCollection = () => {
      return new Promise((resolve, reject) => {
        COLL.findOne({_id:objectid},
          (err, doc) => { 
            resolve(doc); 
        });
        
      });
    };


    var getGroup = async (doc) => {
      var adminname = "";
      var adminimage = "";

      if (doc.groupadminid != null && doc.groupadminid != '') {
        var userresult = await global.lookupUserName(db, doc.groupadminid);
        adminname = userresult.username;
        adminimage = userresult.imagepath;
      }

      var group = new Group.Group_CS(
        doc._id, 
        doc.groupname,
        adminname,
        doc.groupadminid,
        adminimage,
        doc.description);
      
      return group;
    };

    //-- ASYNC PROMISE HANDLER
    var handlePromises = async () => {
      var groupCollection = await (getCollection());
      var group = await getGroup(groupCollection);
      return group;
    }

    //-- CALL HANDLER & SEND
    handlePromises().then(function(result) {
      res.send({'group':result});
    });

  });

  
  /** UPDATE the specified group using the given id and object methods
   * @request A group object
   * @response A new object or the updated object
   */
  app.put('/group/update', function(req, res){
    if (!req.body) return res.sendStatus(400);

    var group = req.body;
    var groupid = group.id;

    //- Update User Values EXC password
    COLL.updateOne({_id:ObjectID(groupid)},
      {$set:{
        groupname: group.groupname,
        groupadminid: group.groupadminid,
        description: group.description
      }},
      ()=>{
          res.send({'result':group._id});
    });

  });


  /** DETAIL of the specified group record
   * including channels and members
   * @request id Group Id
   * @returns response Group object
   */
  app.get('/group/detail', function(req, res){
    if (!req.body) return res.sendStatus(400);

    var id = req.query['id'];
    var curruserid = req.query['curruserid'];
    var issuper = req.query['issuper'];
    var objectid = ObjectID(id);

    //-- DECLARE PROMISES
    var getCollection = async () => {
      return new Promise((resolve, reject) => {
        COLL.findOne({_id:objectid},
          (err, groupdoc) => { 
            resolve(groupdoc); 
        },
        (err)=>{ resolve(null) });
        
      });
    };

    //-- ASYNC PROMISE HANDLER
    var handlePromises = async () => {
      var groupCollection = await (getCollection());
      var group = await getSingleGroup(
        db, ObjectID, groupCollection, issuper, curruserid);
      return group;
    }

    //-- CALL HANDLER & SEND
    handlePromises().then(function(result) {
      res.send({'group':result});
    });
    
  });


  /** DELETE the specified group
   * @request id Group Id
   * @returns response boolean - true is deleted otherwise false
   */
  app.delete('/group/delete/:id', function(req, res){
    if (!req.body) return res.sendStatus(400);

    var groupid = req.params['id'];
    if (groupid==null || groupid==undefined || groupid==''){
      res.send({ok:false, error:'Group Id has not been defined'});
    }

    //-- DECLARE PROMISES
    var countChannels = async () => {
      return new Promise((resolve, reject) => {
        COLL.findOne({_id:ObjectID(groupid)},
        (err, doc) => {
          if (doc == null){
            resolve(0);
          } else {
            if(doc.channels == undefined){
              resolve(0);
            } else {
              resolve(doc.channels.length);
            }
            
          }
        });        
      });
    };

    //-- CALL HANDLER & SEND
    countChannels().then(function(numChannels) {

      if (numChannels > 0){
        res.send({ok:false, error:'There are existing Channels for this group\n' +
          'Delete these before removing the Group.'});
        
      } else {
        COLL.deleteOne({_id:ObjectID(groupid)},
          (err,docs) => {
              res.send({ok:true, error:''});
          });
      }
    });

  });


  /** INDEX list of groups with channels for the logged in user
   * and groups where curr user is admin
   */
  app.get('/group/index', function(req, res){

    var issuper = req.query['issuper'];
    var userid = req.query['curruserid'];
    var groups = [];

    //-- PROMISES
    var getCollection = async() => {
      return new Promise((resolve, reject) => {
        if (issuper == 'true'){
          COLL.find().toArray(
            (err,data) => { resolve(data); });
        } else {
          COLL.find({$or:[{groupadminid:userid},
            {'channels.members.userid':userid},
            {'groupassists.userid':userid} ]}).toArray(
            (err,data) => { 
              resolve(data); 
            });
        }
      });
    };

    var getArray = async (groupCollection) => {
      var data = groupCollection;

      if (data != null){
        for (var g=0; g < data.length; g++){
          var groupdoc = data[g];
          var newgroup = await getSingleGroup(
            db, ObjectID, groupdoc, issuper, userid);

          groups.push(newgroup);
        }
      }

      return groups;
    };

    //-- ASYNC HANDLER
    var handlePromises = async () => {
      if (userid==null || userid==undefined || userid==''){
        return [];
      } else {
        var groupCollection = await (getCollection());
        var groupArray = await (getArray(groupCollection));
        return groupArray;
      }
    }

    //-- CALL HANDLER & SEND
    handlePromises().then(function(result) {
      res.send({'groups':result});
    });

  });


  /** UPDATE the specified Group Assist element using the given id and object methods
   * @request A group assist object
   * @response A new object or the updated object
   */
  app.post('/groupassist/create', function(req, res){

    var groupid = ObjectID(req.body.groupid);
    var newassist = new GroupAssist.GroupAssist(req.body.userid);

    //-- Find the group doc --
    COLL.updateOne({_id:groupid},
      {$push: {groupassists: newassist}},
      () => {
        res.send({'ok':true,'result':newassist._id});
    });

  });

  
  /** DELETE the specified group assist object
   * @request id GroupAssist Id XXX
   * @returns response boolean - true is deleted otherwise false
   */
  app.delete('/groupassist/delete', function(req, res){
    if (!req.query) return res.sendStatus(400);
    
    var assistid = new ObjectID(req.query['id']);
    var groupid = new ObjectID(req.query['groupid']);

    COLL.updateOne({_id: groupid },
      {$pull: {'groupassists': {_id: assistid }}},
      (err, result)=>{
        res.send({ok:true, error:''});
    });

  });    

}


//--- PRIVATE FUNCTIONS ---

/** Get an array of groups where the User is a GroupAdmin
 * @param db: Reference to MongoDb
 * @param ObjectID: Reference to ObjectID of MongoDb
 * @param userid: ObjectId of the user
 * @returns Array of Group objects
 */
function getGroupsForUser(db, ObjectID, userid) {
  //-- VARIABLES
  groups = [];
  var coll = db.collection('groups');

  //-- PROMISES
  var getCollection = () => {
    return new Promise((resolve, reject) => {
      coll.find({$or:[{groupadminid:userid},
          {'channels.members.userid':userid},
          {'groupassists.userid':userid}]}).toArray(
          (err,data) => { 
            resolve(data); 
          });
    });
  };

  var getArray = async (groupCollection) => {
      var data = groupCollection;

      for (var g=0; g < data.length; g++){
        var groupdoc = data[g];
        var newgroup = await getSingleGroup(
          db, ObjectID, groupdoc, 'False', userid);
        groups.push(newgroup);
      }

      return groups;
  };

  //-- ASYNC HANDLER
  var handlePromises = async () => {
    var groupCollection = await (getCollection());
    var groupArray = await (getArray(groupCollection));
    return groupArray;
  }
  
  //-- CALL HANDLER & SEND
  return new Promise((resolve, reject) => {
    handlePromises().then(function(result) {
      resolve(result);
      // return result;
    });
  });

}


/** Get the Group object and channels from the specified Group Document
 * @param db: Reference to MongoDb
 * @param ObjectID: Reference to ObjectID of MongoDb
 * @param curruserid: Current user Id or User Id from User record
 * @returns Group object
 */
function getSingleGroup(db, ObjectID, groupdoc, issuper, curruserid){

  var getGroupArray = async () => {
    var userdoc = await (global.lookupUserName(db, groupdoc.groupadminid));
    var adminname = userdoc.username;
    var adminimage = userdoc.imagepath;

    var newgroup = new Group.Group_CS(
      groupdoc._id, 
      groupdoc.groupname,
      adminname,
      groupdoc.groupadminid,
      adminimage,
      groupdoc.description
    );

    newgroup.channels = await getChannels();
    newgroup.groupassists = await getGroupAssists();

    return newgroup;
  };

  var getChannels = async () => {
    if (groupdoc.channels == undefined) return [];
    var channels = [];
    var isassist = false;

    //check if assist
    if (groupdoc.groupassists != undefined){
      for (var a=0; a<groupdoc.groupassists.length; a++){
        if (groupdoc.groupassists[a].userid == curruserid){
          isassist = true;
        }
      }
    }

    for (var c=0; c < groupdoc.channels.length; c++){
      var channeldoc = groupdoc.channels[c];

      if (issuper == 'true' || groupdoc.groupadminid == curruserid || isassist){
        //If SUPER then add then channel straight away
        var newchannel = new Channel.Channel_CS(
          channeldoc._id,
          channeldoc.channelname
        );
        channels.push(newchannel);

      } else {
        //NOT SUPER - only add if curruser is a member
        if (channeldoc.members == undefined) return [];

        for (var m=0; m < channeldoc.members.length; m++){
          var memberdoc = channeldoc.members[m];
          var isassist = await isGroupAssist();

          if (isassist || curruserid == memberdoc.userid){
            var newchannel = new Channel.Channel_CS(
              channeldoc._id,
              channeldoc.channelname
            );
            channels.push(newchannel);
          }
        }
      }

    }

    return channels;
  };

  var isGroupAssist = async () => {
    if (groupdoc.groupassists == undefined) return false;
    var found = false;

    for (var a=0; a < groupdoc.groupassists.length; a++){
      var assist = groupdoc.groupassists[a];
      if (assist.userid == curruserid){
        found = true;
      }
    }

    return found;
  };

  var getGroupAssists = async () => {
    if (groupdoc.groupassists == undefined) return [];

    var assists = [];

    for (var a=0; a < groupdoc.groupassists.length; a++){
      var assistdoc = groupdoc.groupassists[a];
      var userdoc = await (global.lookupUserName(db, assistdoc.userid));

      var assist = new GroupAssist.GroupAssist_CS(
        assistdoc._id,
        assistdoc.userid,
        userdoc.username,
        userdoc.imagepath
      );
      
      assists.push(assist);
    }

    return assists;
  };

  return new Promise((resolve, reject) => {
    getGroupArray().then(function(result) {
      resolve(result);
    });
  });
}


 //--- MODULE.EXPORTS ---
 
module.exports.getGroupsForUser = getGroupsForUser;