const IMAGES = "http://localhost:3000/userimages/";
const DEF_IMG = "default.png";
var  ObjectID = require('mongodb').ObjectID;

/** User Class
 * class used to save objects to MongoDb
 * @param id (number): The id number of the user. 0 if new user.
 * @param username (string): The username of the user. 
 */
class User {
  constructor(username, email, securitylevel, 
    image, securitycode, passwordhash) {
      this._id = new ObjectID();
      this.username = username;
      this.email = email;
      this.securitylevel = securitylevel;
      this.image = image;
      this.securitycode = securitycode;
      this.passwordhash = passwordhash;
  }
}


/** User Class - for Client side user objects
 * (CS stands for client-side)
 * Includes array properties of Channels, Groups and GroupAssists
 * @param id (string): The OBjectId of the user.
 * @param username (string): The username of the user. 
 * @param email (string):
 * @param securitylevel (string):
 * @param image (string): href where image is stored
 */
class User_CS {
  constructor(id, username, email, securitylevel, image) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.securitylevel = securitylevel;
    this.groups = [];

    if (image == "" || image == undefined || image ==null){
      this.image = DEF_IMG;
      this.imagepath = IMAGES + DEF_IMG;
    } else {
      this.image = image;
      this.imagepath = IMAGES + image;
    }
  }
}

module.exports.User = User;
module.exports.User_CS = User_CS;
