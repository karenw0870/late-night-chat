var ObjectID = require('mongodb').ObjectID;

class ChannelMember {
  constructor(userid) {
    this._id = new ObjectID();
    this.userid = userid;
  }
}


class ChannelMember_CS {
  constructor(id, userid, useridname, userimagepath) {
    this.id = id;
    this.userid = userid;
    this.useridname = useridname;
    this.userimagepath = userimagepath;
  }
}

module.exports.ChannelMember = ChannelMember;
module.exports.ChannelMember_CS = ChannelMember_CS;
