const g = require('../functions/global.js');
const path = 'http://localhost:3000';
const space = '      -';
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let expect = chai.expect();
chai.use(chaiHttp);

/* Information (100–199), Success (200–299),
  Redirects (300–399), 
  Client err (400–499) (Routing?), Server err (500–599).
*/

/* NOTE: To run tests clear old data and add test data first:  
  node test/testdata  (for testing)
  npm test (to run tests)
*/

// Use this user to create a new user, then use to test delete
let groupnameText = 'Jakes chat';
let channelnameText = 'Basic Training';
let superuserText = 'Karen';
let groupuserText = 'Jake';
let generaluserText = 'Penny';

let groupnameId = '';
let channelnameId = '';
let superuserId = '';
let groupuserId = '';
let generaluserId = '';

let testChannelId = '';
let testMemberId = '';
let testAssistId = '';

let testUser = {'username':'TestUser', 'email':'test@somewhere.com', 'securitylevel':'general', 'password':"123"};
let testGroup = {'groupadminidname': 'Dean','groupname': 'Test Group','description': 'description of the new test group'};
let testAssist = {'useridname':'Edan','groupidname':'Deans chat'};
let testChannel = {'channelname': 'Get motivated','groupidname': 'Deans chat'};
let testMember = {'useridname': 'Edan','groupidname': 'Deans chat', 'channelidname':'When work calls'};


console.log('---------------------------------------------------------------------------------------');

describe(">> User Routes", function() {

  describe('* Index Route', function() {

    it('Body contains Users property', function(done) {

      chai.request(path)
        .get('/user/index')
        .end( (err,res) => {
          res.should.have.status(200);
          res.body.should.have.property('users');
          done();
        });
  
    });


    it('Return an array', function(done) {

      chai.request(path)
        .get('/user/index')
        .end( (err,res) => {
          res.should.have.status(200);
          res.body.users.should.be.a('array');
          done();
        });
  
    });

  });


  describe('* Create Route', function() {

    it('Post /user/create: record is created', (done) => {
  
      chai.request(path)
        .post('/user/create')
        .send(testUser)
        .end( (err,res) => {
          res.body.ok.should.equals(true);
          done();
        });

    });
  
  
    it('Post /user/create: check for duplicate username', (done) => {
  
      chai.request(path)
        .post('/user/create')
        .send(testUser)
        .end( (err,res) => {
          var errmsg = res.body.error;
          errmsg.should.equal('Username has already been used');
          done();
        });
    });

  });


  describe('* Update Routes', function() {

    it('Get /user/update/:id: record is found for updating', (done) => {
      lookupGeneralUserId().then(
        function(useridvalue){
            chai.request(path)
            .get('/user/update/' + useridvalue)
            .end( (err,res) => {
              res.should.have.status(200);
              res.body.user.should.have.property('username').equal(generaluserText);
              done();  
            });
        });
    });

  });


  describe('* Detail Route', function() {

    it('Get /user/detail/:id: found & route contains groups array', (done) => {
      lookupGroupUserId().then(
        function(useridvalue){
            chai.request(path)
            .get('/user/detail/' + useridvalue)
            .end( (err,res) => {
              res.should.have.status(200);
              res.body.user.should.have.property('username').equal(groupuserText);
              res.body.user.should.have.property('groups');
              // var count = res.body.user.groups.length;
              // count.should.be.gt(0); 
              done();
            });
        });
    });

  });

  
  describe('* Delete Route', function() {

    before(function() {console.log(space,'Delete /user/delete/:id')});
  
    it('Must be at least 1 Super user', (done) => {
      lookupSuperUserId().then(
        function(useridvalue){
            chai.request(path)
            .delete('/user/delete/' + useridvalue)
            .end( (err,res) => {
              res.should.have.status(200);
              res.body.error.should.equal('There must be at least 1 Super user');
              done();  
            });
        });

    });

    it('Cannot delete GroupAdmins', (done) => {
      lookupGroupUserId().then(
        function(useridvalue){;
            chai.request(path)
            .delete('/user/delete/' + useridvalue)
            .end( (err,res) => {
              res.should.have.status(200);
              res.body.error.should.include('Delete these groups or reassign each group');
              done();  
            });
        });
    });

    it('Can delete User', (done) => {
      g.getDb_lookupUserId(testUser.username).then(
        function(useridvalue){
            chai.request(path)
            .delete('/user/delete/' + useridvalue)
            .end( (err,res) => {
              res.should.have.status(200);
              res.body.ok.should.equal(true);
              res.body.error.should.equal('');
              done();  
            });
        });
    });
 

  });


  describe('* Other Routes', function() {

    it('Get /user/count: count of users', (done) => {

      chai.request(path)
        .get('/user/count')
        .end( (err,res) => {
          res.should.have.status(200);
          // res.body.count.should.equal(9);
          done();  
      });

    });

    it('Get /user/findsuper: return 1 if Super user entered', (done) => {
      lookupGroupUserId().then(
        function(useridvalue){
            chai.request(path)
            .get('/user/findsuper')
            .end( (err,res) => {
              res.should.have.status(200);
              res.body.count.should.equal(1);
              done();
            });
        });
    });

    it('Get /user/selection: array of id,username for dropdown lists', (done) => {

      chai.request(path)
        .get('/user/selection')
        .end( (err,res) => {
          res.should.have.status(200);
          res.body.users[0].should.have.keys('id','username');
          // res.body.users.should.have.lengthOf(9); // If test data has been added again
          done();  
      });

    });

  });

});


describe(">> Group Routes", function() {


  describe('* Index Route', function() {

    it('All groups should be returned for SuperUser', function(done) {
      lookupSuperUserId().then(
        function(useridvalue){
          chai.request(path)
          .get('/group/index')
          .query({issuper:true,curruserid:useridvalue})
          .end( (err,res) => {
            res.should.have.status(200);
            res.body.should.have.property('groups');
            res.body.groups.should.be.a('array');
            // res.body.groups.length.should.equal(4);
            done();
          });
        });
  
    });


    it('Returns groups where user is admin or member', function(done) {
      lookupGroupUserId().then(
        function(useridvalue){
          chai.request(path)
          .get('/group/index')
          .query({issuper:false,curruserid:useridvalue})
          .end( (err,res) => {
            res.should.have.status(200);
            res.body.groups.should.be.a('array');
            // res.body.groups.length.should.equal(2);
            done();
          });
        });
  
    });

  });


  describe('* Create Route', function() {

    it('Post /group/create: record is created', (done) => {
  
      chai.request(path)
        .post('/group/create')
        .send(testGroup)
        .end( (err,res) => {
          res.body.ok.should.equals(true, 'Does not equal true -> ' + res.body.error);
          done();
        });

    });
  
  
    it('Post /group/create: check for duplicate group', (done) => {
  
      chai.request(path)
        .post('/group/create')
        .send(testGroup)
        .end( (err,res) => {
          var errmsg = res.body.error;
          errmsg.should.equal('Group has already been entered');
          done();
        });
    });

  });


  describe('* Update Routes', function() {

    it('Get /group/update/:id: record is found for updating', (done) => {
      lookupGroupNameId().then(
        function(groupidvalue){
            chai.request(path)
            .get('/group/update/' + groupidvalue)
            .end( (err,res) => {
              res.should.have.status(200);
              res.body.group.should.have.property('groupname').equal(groupnameText);
              done();  
            });
        });
    });

  });


  describe('* Detail Route', function() {

    it('Get /group/detail: record is found', (done) => {
      lookupSuperUserId().then(
        function(useridvalue){
          lookupGroupNameId().then(
            function(groupidvalue){
              var qry = { 'curruserid':useridvalue, 'id':groupidvalue, 'issuper':true };

              chai.request(path)
              .get('/group/detail')
              .query(qry)
              .end( (err,res) => {
                res.should.have.status(200);
                res.body.group.groupname.should.equal(groupnameText, 
                  'Does not equal: Actual=' + res.body.group.groupname);
                done();  
              });

            });
        });
    });

    it('Get /group/detail: found & route contains channels array', (done) => {
      lookupSuperUserId().then(
        function(useridvalue){
          lookupGroupNameId().then(
            function(groupidvalue){
              var qry = { 'curruserid':useridvalue, 'id':groupidvalue, 'issuper':true };

              chai.request(path)
              .get('/group/detail')
              .query(qry)
              .end( (err,res) => {
                res.should.have.status(200);
                res.body.group.should.have.property('channels');
                // var count = res.body.group.channels.length;
                // count.should.be.gt(0); 
                done();
              });

            });
        });
          
    });

  });

  
  describe('* Delete Route', function() {

    before(function() {console.log(space,'Delete /group/delete/:id')});

    it('Do not delete if existing channels', (done) => {
      lookupGroupNameId().then(
        function(groupidvalue){
            chai.request(path)
            .delete('/group/delete/' + groupidvalue)
            .end( (err,res) => {
              res.should.have.status(200);
              res.body.error.should.contain('There are existing Channels for this group');
              done();  
            });
        });

    });


    it('Can delete Group', (done) => {
      g.getDb_lookupGroupId(testGroup.groupname).then(
        function(groupidvalue){
            chai.request(path)
            .delete('/group/delete/' + groupidvalue)
            .end( (err,res) => {
              res.should.have.status(200);
              res.body.ok.should.equal(true);
              res.body.error.should.equal('');
              done();  
            });
        });
    });
 
  });


  describe("* GroupAssist Routes", function() {
  
    it('Post /groupassist/create', (done) => {

      g.getDb_lookupUserId(testAssist.useridname).then(
        function(useridvalue){
          g.getDb_lookupGroupId(testAssist.groupidname).then(
            function(groupidvalue){
              var assist = {userid:useridvalue,groupid:groupidvalue};

              chai.request(path)
              .post('/groupassist/create')
              .send(assist)
              .end( (err,res) => {
                testAssistId = res.body.result;
                res.body.ok.should.equals(true);
                done();
              });

          });
        });

    });
  
    it('Delete /groupassist/delete', (done) => {

      // g.getDb_lookupUserId(testAssist.useridname).then(
      //   function(useridvalue){
          g.getDb_lookupGroupId(testAssist.groupidname).then(
            function(groupidvalue){
              var qry = {id:testAssistId,groupid:groupidvalue};

              chai.request(path)
              .delete('/groupassist/delete')
              .query(qry)
              .end( (err,res) => {
                res.should.have.status(200);
                res.body.ok.should.equal(true);
                res.body.error.should.equal('');
                done();  
            });
        // });
      });

    });
  
  });

});


describe(">> Channel Routes", function() {

  describe('* Create Route', function() {
    
    it('Post /channel/create: record is created', (done) => {

      g.getDb_lookupGroupId(testChannel.groupidname).then(
        function(groupidvalue){
          var channel = {channelname:testChannel.channelname, groupid:groupidvalue};

          chai.request(path)
          .post('/channel/create')
          .send(channel)
          .end( (err,res) => {
            testChannelId = res.body.result;
            res.body.ok.should.equals(true);
            done();
          });

        });

    });

  });


  describe.skip('* Update Routes', function() {

    it('Get (SOCKETS) /channel/update/:id: record is found for updating', (done) => {
      lookupChannelNameId().then(
        function(channelidvalue){
            chai.request(path)
            .get('/channel/update/' + channelidvalue)
            .end( (err,res) => {
              res.should.have.status(200);
              res.body.channel.should.have.property('channelname').equal(channelnameText);
              done();  
            });
        });
    });

  });


  describe.skip('* Detail Route', function() {

    it('Get (SOCKETS) /channel/detail: record is found', (done) => {

      lookupChannelNameId().then(
        function(channelidvalue){

          chai.request(path)
          .get('/channel/detail/' + channelidvalue)
          .end( (err,res) => {
            res.should.have.status(200);
            res.body.channel.channelname.should.equal(channelnameText);
            res.body.channel.should.have.property('members');
            done();  
          });

        });

    });

  });

  
  describe('* Delete Route', function() {

    it('Can delete Channel', (done) => {

      g.getDb_lookupGroupId(testChannel.groupidname).then(
        function(groupidvalue){
          var qry = {'id':testChannelId, 'groupid':groupidvalue};
          chai.request(path)
          .delete('/channel/delete')
          .query(qry)
          .end( (err,res) => {
            res.should.have.status(200);
            res.body.result.should.equal(1);
            res.body.error.should.equal('');
            done();  
          });
        });



    });
 
  });


  describe("* ChannelMember Routes", function() {
  
    it('Post /member/create', (done) => {

      g.getDb_lookupUserId(testMember.useridname).then(
        function(useridvalue){
          g.getDb_lookupChannelId(testMember.channelidname).then(
            function(channelidvalue){
              var member = {userid:useridvalue, channelid:channelidvalue};

              chai.request(path)
              .post('/member/create')
              .send(member)
              .end( (err,res) => {
                testMemberId = res.body.result;
                res.body.ok.should.equals(true);
                done();
              });

          });
        });

    });
  
    it('Delete /member/delete', (done) => {

      chai.request(path)
      .delete('/member/delete/' + testMemberId)
      .end( (err,res) => {
        res.should.have.status(200);
        res.body.ok.should.equal(true);
        res.body.error.should.equal('');
        done();  
      });

    });
  
  });

});


//--- getDb_?? for testing purposes
// Functions get the Id for the specified text to test in routes

async function lookupGroupNameId() {
  if (groupnameId==''){
    var id = await g.getDb_lookupGroupId(groupnameText);
    groupnameId = id;
    return groupnameId;
  } else {
    return groupnameId;
  }
}

async function lookupChannelNameId() {
  if (channelnameId==''){
    var id = await g.getDb_lookupChannelId(channelnameText);
    channelnameId = id;
    return channelnameId;
  } else {
    return channelnameId;
  }
}


async function lookupSuperUserId(username) {
  if (superuserId==''){
    var id = await g.getDb_lookupUserId(superuserText);
    superuserId = id;
    return superuserId;
  } else {
    return superuserId;
  }
}

async function lookupGroupUserId() {
  if (groupuserId==''){
    var id = await g.getDb_lookupUserId(groupuserText);
    groupuserId = id;
    return groupuserId;
  } else {
    return groupuserId;
  }
}

async function lookupGeneralUserId() {
  if (generaluserId==''){
    var id = await g.getDb_lookupUserId(generaluserText);
    generaluserId = id;
    return generaluserId;
  } else {
    return generaluserId;
  }
}


