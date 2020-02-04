import { Channel } from './channel';
import { Group } from './group';
import { GroupAssist } from './groupassist';

export class User {
  
  id:string;
  username:string;
  email:string;
  password:string;
  securitylevel:string;
  securitycode:string;
  passwordhash:string;
  image:string;
  imagepath:string;
  // channels:Channel[];
  // groupassists:GroupAssist[];
  groups:Group[];

  constructor(id:string = "") {
    this.id = id;
    this.username = "";
    this.email = "";
    this.securitylevel = "";
    
    this.password = "";
    this.securitycode = "";
    this.passwordhash = "";

    this.image = "";
    this.imagepath = "";
    this.groups = [];
  }
}
