var ObjectID = require('mongodb').ObjectID;

class Message {
  constructor(userid, content) {
    this.id = new ObjectID();
    this.userid = userid;
    this.content = content;
  }
}


class Message_CS {
  constructor(id, userid, useridname, userimagepath, content) {
    this.id = id;
    this.userid = userid;
    this.useridname = useridname;
    this.userimagepath = userimagepath;
    this.content = content;
  }
}

module.exports.Message = Message;
module.exports.Message_CS = Message_CS;
