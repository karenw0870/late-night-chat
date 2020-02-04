
export class ChannelMember {
  
  id:string;
  userid:string;
  useridname:string;
  userimagepath:string;
  channelid:string;
  channelidname:string;
  groupid:string;
  groupidname:string;

  constructor(id:string = "") {
    this.id = id;
    this.userid = "";
    this.useridname = "";
    this.userimagepath = "";
    this.channelid = "";
    this.channelidname = "";
    this.groupid = "";
    this.groupidname = "";
  }
}
