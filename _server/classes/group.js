var  ObjectID = require('mongodb').ObjectID;

class Group {
  constructor(groupname, groupadminid, description) {
    this._id = new ObjectID();
    this.groupadminid = groupadminid;
    this.groupname = groupname;
    this.description = description;
  }
}


class Group_CS {
  constructor(id, groupname, groupadminidname, 
      groupadminid, groupadminimagepath, description) {
    this.id = id;
    this.groupadminid = groupadminid;
    this.groupadminidname = groupadminidname;
    this.groupadminimagepath = groupadminimagepath,
    this.groupname = groupname;
    this.description = description;
    this.channels = [];
    this.groupassists = [];
  }
}


module.exports.Group = Group;
module.exports.Group_CS = Group_CS;
