var ObjectID = require('mongodb').ObjectID;

class GroupAssist {
  constructor(userid) {
    this._id = new ObjectID();
    this.userid = userid.toString();
  }
}


class GroupAssist_CS {
  constructor(id, userid, useridname, userimagepath) {
    this.id = id;
    this.userid = userid;
    this.useridname = useridname;
    this.userimagepath = userimagepath;
    this.groupid = "";
  }
}


module.exports.GroupAssist = GroupAssist;
module.exports.GroupAssist_CS = GroupAssist_CS;
