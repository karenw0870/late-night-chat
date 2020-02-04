import { Channel } from './channel';
import { GroupAssist } from './groupassist';

export class Group {

  id:string;
  groupadminid:string;
  groupadminidname:string;
  groupname:string;
  description:string;
  groupadminimagepath:string;
  channels:Channel[];
  groupassists:GroupAssist[];

  constructor(id:string = "") {
    this.id = id;
    this.groupadminid = "";
    this.groupadminidname = "";
    this.groupadminimagepath = "";
    this.groupname = "";
    this.description = "";
    this.channels = [];
    this.groupassists = [];
  }
}
