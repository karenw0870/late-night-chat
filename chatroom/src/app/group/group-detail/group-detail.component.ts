import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';
import { GroupService } from '../../_services/group.service';
import { ChannelService } from '../../_services/channel.service';
import { Group } from '../../_models/group';
import { GroupAssist } from '../../_models/groupassist';
import { User } from '../../_models/user';
import { Channel } from 'src/app/_models/channel';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {

  group:Group;
  assisttextentry:string;
  assistuserselect:string;
  userselect:UserSelect[];
  newchannelname:string;

  currUserId:string;
  isSuper:boolean;
  isGroup:boolean;
  isAssist:boolean;

  constructor(private route:ActivatedRoute, private router:Router,
    private groupService:GroupService, 
    private channelService:ChannelService,
    private authService:AuthService, 
    private userService:UserService
    ) {

      this.group = new Group();
      this.userselect = [];
      this.assisttextentry = "";
      this.assistuserselect = "";
      this.newchannelname = "";

      this.currUserId = this.authService.currUserId;
      this.isSuper = this.authService.currIsSuper;
      this.isGroup = this.authService.currIsGroup;
      this.isAssist = false;
    }


  ngOnInit() {
    this.userService.getUserSelect().subscribe(
      (data:[]) => {
        this.userselect = data['users'];
      });

    this.route.paramMap.subscribe(params => {
      if (this.currUserId == ""){
        this.router.navigateByUrl('/login');
      } else {
        this.getGroup(params.get('id'));
      }
    });
  }
  
  
  /** Retrieve a single group record
   * 
   */
  getGroup(groupid:string) {
    return this.groupService.getGroup(
        groupid, this.currUserId, this.isSuper.toString()).subscribe(
      (newgroup) => {
        this.group = newgroup['group'];

      },
      (err: HttpErrorResponse) => {
        console.log("GroupDetail ERROR LOG: " + err.message); 
      },
      () => {
        if (this.group.groupadminid == this.currUserId || this.isSuper || this.isGroup){
          this.isAssist = true;
        } else {
          this.isAssist = false;
        }
      }
      );
  }


  /** Delete group from external storage using API
   * 
   */
  deleteGroup(id:string) {
    
    var groupsaved = false

    return this.groupService.deleteGroup(id).subscribe(
      (deleted) => { 
        if (deleted['ok'] == false){
          alert(deleted['error']);
        } else {
          groupsaved = true;
        }
      },
      (err: HttpErrorResponse) => {
        alert("auth.service ERROR LOG: " + err.error); 
      },
      () => {
        if (groupsaved) this.router.navigateByUrl('/dashboard');
      });

  }
  

  /** Save the new user, if needed, to external storage using API 
   */
  addUser() {
    if (this.assistuserselect == "" && this.assisttextentry == ""){
      alert("You must enter a username or select an existing user from the list");
    } else {
      if (this.assisttextentry.trim() != "") {
        // add new user
        var newuserid:string = "";
        var user:User = new User();
        user.username = this.assisttextentry;
        user.securitylevel = "general";
        user.password = "chatroom";
  
        return this.userService.updateUser(user).subscribe(
          (data) => {
            newuserid = data['result'];
            this.addGroupAssist(newuserid);
          },
          (err: HttpErrorResponse) => {
            console.log("GroupDetail ERROR LOG: " + err.message); 
          },
          () => {
            this.assisttextentry = "";
            this.assistuserselect = "";

            
          }
          );
      } else {
        this.addGroupAssist(this.assistuserselect);
      }
    }
  }


  /** Save the group assist to external storage using API
   * 
   */  
  addGroupAssist(userid:string) {
    var assist:GroupAssist = new GroupAssist();
    assist.userid = userid;
    assist.groupid = this.group.id;

    return this.groupService.createGroupAssist(assist).subscribe(
      (data) => {
        this.assisttextentry = "";
        this.assistuserselect = "";
      },
      (err: HttpErrorResponse) => {
        console.log("GroupDetail ERROR LOG: " + err.message); 
      },
      () => {
        this.getGroup(this.group.id);
      });
  }


  /** Save the group to external storage using API
   * 
   */
  deleteGroupAssist(id:string) {

    var saved = false;

    return this.groupService.deleteGroupAssist(id, this.group.id).subscribe(
      (data) => { 
        saved = data['ok'];
      },
      (err: HttpErrorResponse) => {
        alert("group-detail-comp ERROR LOG: " + err.error); 
      },
      () => {
        if (saved) this.getGroup(this.group.id);
      });

  }


  /** Add a new channnel to the current group
   * 
   */
  addChannel() {
    var newchannel = new Channel();
    newchannel.channelname = this.newchannelname;
    newchannel.groupid = this.group.id;

    return this.channelService.createChannel(newchannel).subscribe(
      (data) => {
       
      },
      (err: HttpErrorResponse) => {
        console.log("GroupDetail ERROR LOG: " + err.message); 
      },
      () => {
        this.newchannelname = "";
        this.getGroup(this.group.id);
      }
      );

  }
 

}

