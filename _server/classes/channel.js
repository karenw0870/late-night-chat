var ObjectID = require('mongodb').ObjectID;

class Channel {
  constructor(channelname) {
    this._id = new ObjectID();
    this.channelname = channelname;
    this.members = [];
    this.messages = [];
  }
}


class Channel_CS {
  constructor(id, channelname) {
    this.id = id;
    this.channelname = channelname;
    this.groupid = "";
    this.groupidname = "";
    this.groupadminid = "";
    this.members = [];
    this.messages = [];
  }
}


module.exports.Channel = Channel;
module.exports.Channel_CS = Channel_CS;
