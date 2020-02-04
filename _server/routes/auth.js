

let User_CS = require('../classes/user').User_CS;
let encodePassword = require('../functions/global').encodePassword;


module.exports = function(db, app, ObjectID) {

  const COLL = db.collection('users');

  /** Authorise the current user logging in
   * Check the stored data to determine if valid entry
   * @request { username:m, password:m }
   * @response { valid:true, error:errormessage, user:User_CS } if valid otherwise false
   */
  app.post('/auth', function(req, res){

    var username = req.body.username;
    var password = req.body.password;

    //- Find object by username
    COLL.findOne({username:username},
      (err, doc) => {
        if (err != null){
          res.send({'valid':false, 'error':err});
        }

        if (doc == null){
          res.send({'valid':false, 'error':'User does not exist'});
        } else {
          var salt = doc.securitycode;
          var passwordhash = doc.passwordhash; 
          var passwordcheck = encodePassword(password, salt);

          if (passwordhash == passwordcheck.passwordhash) {
            var newuser = new User_CS(
              doc._id,
              doc.username,
              doc.email,
              doc.securitylevel,
              doc.image
            );

            res.send({'valid':true, 'user':newuser});
          } else {
            res.send({'valid':false, 'error':'The password is invalid'});
          }

        }
      }
    );

  });

}
