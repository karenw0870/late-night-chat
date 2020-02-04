
let User = require('../classes/user').User;
let User_CS = require('../classes/user').User_CS;
let groupModules = require('../routes/group');
let encodePassword = require('../functions/global').encodePassword;


module.exports = function(db, app, ObjectID, formidable) {

  const COLL = db.collection('users');

  /** CREATE a new user with values from the given user object
   * @request A user object - inc password
   * @response _id of saved User
   */
  app.post('/user/create', function(req, res){
    if (!req.body) return res.sendStatus(400);

    var user = req.body;
    var security = encodePassword(user.password, '');

    var newuser = new User(
      user.username,
      user.email,
      user.securitylevel,
      user.image,
      security.salt,
      security.passwordhash
    );

    //-- Check if user exists --
    COLL.findOne({username:user.username},
      (err, doc) => {
        if (doc == null){

          COLL.insertOne(newuser, 
            (err, dbresult) => {
              res.send({'ok':true, 'result':dbresult.insertedId, 'error':err});
          });
        } else {
          res.send({'ok':true, 'result':'', 
            'error':'Username has already been used',
            'err':err});
        }
      }
    );
  });


  /** UPDATE the specified user using the given id and object methods
   * Password only updated if passed in with User Object
   * @request A user object 
   * @response _id of saved User
   */
  app.put('/user/update', function(req, res){
    if (!req.body) return res.sendStatus(400);
    
    var user = req.body;
    var objectid = ObjectID(user.id);

    //- Update Password if passed in
    if ((user.password != undefined && user.password != "") 
        || (user.securitycode == null && user.securitycode != undefined)
        || (user.passwordhash == null && user.passwordhash != undefined)){

      var security = encodePassword(user.password, '');

      //- Update User Values
      COLL.updateOne({_id:objectid},
        {$set:{
          username: user.username,
          email: user.email,
          securitylevel: user.securitylevel,
          image: user.image,
          securitycode: security.securitycode,
          passwordhash: security.passwordhash
        }},
        ()=>{
            res.send({'result':user._id});
      });

    } else {
      //- Update User Values EXC password
      COLL.updateOne({_id:objectid},
        {$set:{
          username: user.username,
          email: user.email,
          securitylevel: user.securitylevel,
          image: user.image
        }},
        ()=>{
            res.send({'result':user._id});
      });
    }
  });


  /** GET the specified user for UPDATE
   * @request A user object 
   * @response User object
   */
  app.get('/user/update/:id', function(req, res){
    if (!req.body)return res.sendStatus(400);

    var userid = req.params['id'];
    var objectid = ObjectID(userid);

    COLL.findOne({_id:objectid},
      (err, doc) => {
        var user = new User_CS(
          doc._id, 
          doc.username,
          doc.email,
          doc.securitylevel,
          doc.image
        );

        res.send({'user':user});
    });

  });


  /** DETAIL of the specified user record
   * @param id : User Id
   * @response User object
   */
  app.get('/user/detail/:id', function(req, res){
    if (!req.body) return res.sendStatus(400);

    //-- VARIABLES
    var userid = req.params['id'];
    var objectid = ObjectID(userid);
  
    //-- PROMISES
    var getCollection = () => {
      return new Promise((resolve, reject) => {
        COLL.findOne({_id:objectid},
          (err,data) => { 
            if (err != null){
              reject({'ERROR':err});
            } else {
              resolve(data); 
            }
          });
      });
    };

    var getObject = async (userCollection) => {
      var doc = userCollection;
      var user = new User_CS(
        doc._id, 
        doc.username,
        doc.email,
        doc.securitylevel,
        doc.image);

      user.groups = await groupModules.getGroupsForUser(db, ObjectID, userid);
      
      return user;
    };

    //-- ASYNC HANDLER
    var handlePromises = async () => {
      var userCollection = await (getCollection());
      var userObject = await (getObject(userCollection));
      return userObject;
    }
    
    //-- CALL HANDLER & SEND
    handlePromises().then(function(result) {
      res.send({'user':result});
    });
    
  });


  /** DELETE the specified user
   * @request id User Id
   * @response response boolean - true is deleted otherwise false
   */
  app.delete('/user/delete/:id', function(req, res){
    if (!req.body) return res.sendStatus(400);

    let userid = req.params['id'];
    let objectid = ObjectID(userid);

    if (userid==null || userid==undefined || userid==""){
      res.send({ok:false, error:'A user Id has not been specified'});
    }

    //-- PROMISES
    var getIsSuper = () => {
      return new Promise((resolve, reject) => {
        COLL.findOne({_id:objectid},
          (err,data) => { 
            if (data.securitylevel == 'super'){
              resolve(true);
            } else {
              resolve(false);
            }
        },
        () => { resolve(false); });
      });
    };    
  
    var countOtherSupers = (currissupper) => {
      return new Promise((resolve, reject) => {
        if (currissupper == true){
          COLL.find([{_id:{$ne:objectid}}, {securitylevel:"super"}]).count(
            (err, value) => {
              if (value == null){
                resolve(0);
              } else {
                resolve(value);
              }
              
          });
        } else {
          resolve(0);
        }
      });
    };    
  
    var countAdmins = () => {
      return new Promise((resolve, reject) => {
        db.collection('groups').find({groupadminid:userid}).count(
          (err, value) => {
            if (value == null || err != null){
              resolve(0);
            } else {
              resolve(value);
            }
        });
      });
    }; 


    //-- DELETION
    var deleteRecord = (numadmins, numsupers, currsuper) => {
      return new Promise((resolve, reject) => {
        if (numadmins > 0){
          resolve({ok:false, error:'This user is the Admin for ' + numadmins + ' group/s\n' +
          'Delete these groups or reassign each group'});
    
        } else if (numsupers == 0 && currsuper == true){
          resolve({ok:false, error:'There must be at least 1 Super user'});
          
        } else {
          COLL.deleteOne({$or:[{_id:objectid}]},
            (err,docs) => {
              resolve({ok:true, error:''});
            });
        }
      });
    };


    //-- ASYNC HANDLER
    var handlePromises = async () => {
      var currissupper = await getIsSuper();
      var countsupers = await countOtherSupers(currissupper);
      var countadmins = await countAdmins();
      var results = deleteRecord(countadmins,countsupers,currissupper);
      
      return results;
    }
    
    //-- CALL HANDLER & SEND
    handlePromises().then(function(result) {
      res.send(result);
    });


  }); // end app.delete


  /** INDEX list of all users
   * @response An array of User objects
   */
  app.get('/user/index', function(req, res){

    //-- PROMISES
    var getCollection = () => {
      return new Promise((resolve, reject) => {
        COLL.find().toArray(
          (err,data) => { resolve(data); });
      });
    };

    var getArray = async (userCollection) => {
        var data = userCollection;
        var users = [];

        for (var i=0; i < data.length; i++){
          var user = new User_CS(
            data[i]._id, 
            data[i].username,
            data[i].email,
            data[i].securitylevel,
            data[i].image);
          users.push(user);
        }

        return users;
    };

    //-- ASYNC HANDLER
    var handlePromises = async () => {
      var userCollection = await (getCollection());
      var userArray = await (getArray(userCollection));
      return userArray;
    }

    //-- CALL HANDLER & SEND
    handlePromises().then(function(result) {
      res.send({'users':result});
    });

  });


  /** COUNT of all users
   * @response An array of User objects
   */
  app.get('/user/count', function(req, res){

    COLL.find({}).count((err,count)=>{
        res.send({'count':count});
    });

  });


  /** COUNT of all users
   * @response An array of User objects
   */
  app.get('/user/findsuper', function(req, res){

    COLL.find({username:'Super'}).count((err,count)=>{
        res.send({'count':count});
    });

  });


    /** SELECTION list of users for drop down box
   * @response An array of {id:id, username:username}
   */
  app.get('/user/selection', function(req, res){

    COLL.find().toArray(
      (err,data) => { 
        var users = [];

        for (var i=0; i < data.length; i++){
          var user = {
            'id':data[i]._id,
            'username':data[i].username
          };

          users.push(user);
        }
        res.send({'users':users});
      });

  });


  /** Save the file to storage
   * @request
   * @response
   */
  app.post('/user/upload', function (req, res){ 
    
    // Upload directory must be literal
    var form = new formidable.IncomingForm({uploadDir:'./images'});
    form.keepExtensions = true;
    
    // Error on upload
    form.on('error', function(err) {
      // throw err;
      res.send({result:'failed',
        data:{}, 
        message:"Unable to upload user image. Error:" + err
      });
    });

    // upload file to upload directory
    form.on('fileBegin', function (name, file){ 
      file.path = form.uploadDir + '/' + file.name;
    });

    // When the upload has finished
    form.on('file', function (fields, file){ 
      res.send({
        ok:true,
        result:'ok',
        filename:file.name,
        filepath:file.path
      });
    });

    // Begin Processing
    form.parse(req);

  });

}
