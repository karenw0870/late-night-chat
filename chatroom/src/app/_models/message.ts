
export class Message {

  id:string;
  channelid:string;
  channelidname:string;
  userid:string;
  useridname:string;
  userimagepath:string;
  content:string;

  constructor(id:string = "") {
    this.id = id;
    this.channelid = "";
    this.channelidname = "";
    this.userid = "";
    this.useridname = "";
    this.userimagepath = "";
    this.content = "";
  }
}