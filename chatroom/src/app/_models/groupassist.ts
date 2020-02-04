
export class GroupAssist {
  id:string;
  userid:string;
  useridname:string;
  groupid:string;
  userimagepath:string;

  constructor(id:string = "") {
    this.id = id;
    this.userid = "";
    this.useridname = "";
    this.userimagepath = "";
    this.groupid = "";
  }
}
