import { Message } from "./message";
import { ChannelMember } from "./member";
import { GroupAssist } from './groupassist';

export class Channel {
  
  id:string;
  groupid:string;
  groupidname:string;
  groupadminid:string;
  channelname:string;
  members:ChannelMember[];
  messages:Message[];
  groupassists:GroupAssist[];

  constructor(id:string = "") {
    this.id = id;
    this.groupid = "";
    this.groupidname = "";
    this.groupadminid = "";
    this.channelname = "";
    this.members = [];
    this.messages = [];
    this.groupassists = [];
  }
}
