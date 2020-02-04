import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';
import { ChannelService } from '../../_services/channel.service';
import { Channel } from '../../_models/channel';
import { ChannelMember } from '../../_models/member';


@Component({
  selector: 'app-channel-detail',
  templateUrl: './channel-detail.component.html',
  styleUrls: ['./channel-detail.component.css']
})
export class ChannelDetailComponent implements OnInit {

  groupid:string = "";
  groupadminid:string = "";
  channel:Channel;
  memberuserselect:string;
  newmessage:string = "";
  userselect = [];
  groupassists = [];
  messages = [];

  currUserId:string;
  username:string;
  userimage:string;
  isSuper:boolean;
  isGroup:boolean;
  isAssist:boolean;
  classdisplay:string;
  editchannel:boolean = false;
  updatechannel:string = "";

  channelnote:string = "";
  countmembers:number = 0;
  currusers = [];

  constructor(private router:Router, 
    private route:ActivatedRoute,
    private channelService:ChannelService,
    private authService:AuthService, 
    private userService:UserService ) {

      this.channel = new Channel();
      this.memberuserselect = "";
      this.newmessage = "";
      this.classdisplay = "hide-slow";
      
    }

  ngOnDestroy() {
    this.channelService.leaveChannel(this.channel.id, this.username);
  }

  ngOnInit() {
    //-- Initialise socket
    this.setSockets();

    this.userService.getUserSelect().subscribe(
      (data:[]) => {
        this.userselect = data['users'];
      });

    this.isSuper = this.authService.currIsSuper;
    this.isGroup = this.authService.currIsGroup;
    this.currUserId = this.authService.currUserId;
    this.username = this.authService.currUserName;
    this.userimage = this.authService.currUserImage;

    if (this.currUserId in this.channel.groupassists){
      this.isAssist = true;
    } else {
      this.isAssist = false;
    }
    
    this.route.paramMap.subscribe(params => {

      var isassist = params.get('isassist');
      if (isassist.toLowerCase() == 'true'){
        this.isAssist = true;
      } else {
        this.isAssist = false;
      }

      this.groupid = params.get('groupid');
      this.groupadminid = params.get('groupadminid');
      this.getChannel(params.get('id'));
      var assists = params.get('groupassists');

    });


  }
  

  /** Retrieve a single channel record
   *  Trigger join-channel
   */
  private getChannel(channelid:string) {
    this.channelService.joinChannel(channelid, this.username, this.userimage);
  }


  editChannel(){
    this.updatechannel = this.channel.channelname;
    this.editchannel = true;
  }

  saveChannel(){
    var newchannel = new Channel(this.channel.id);
    newchannel.channelname = this.updatechannel;

    this.channelService.updateChannel(newchannel).subscribe(
      (result) => { 
      },
      (err: HttpErrorResponse) => {
        alert("auth.service ERROR LOG: " + err.error); 
      },
      () => {
        this.editchannel = false;
        this.getChannel(this.channel.id);
      });

  }

  cancelEdit(){
    this.updatechannel = "";
    this.editchannel = false;
  }


  deleteChannel(){
    var deleted = false;
    return this.channelService.deleteChannel(this.channel).subscribe(
      (data) => {
        if (data){
          deleted = true;
        } else {
          alert(data);
        }
      },
      (err: HttpErrorResponse) => {
        console.log("ChannelDetail ERROR LOG: " + err.message); 
      },
      () => {
        if (deleted == true) {
          this.router.navigateByUrl('/group/detail/' + this.groupid);
        } 
      });
  }


  sendMessage(){
    this.channelService.sendMessage(this.channel.id, this.currUserId, 
      this.username, this.userimage, this.newmessage);
    this.newmessage = "";
  }


  /** Save the channel member to external storage using API
   * 
   */  
  addChannelMember() {
    if (this.memberuserselect == "") {
      alert("You must select a user.");
    } else {
      var member:ChannelMember = new ChannelMember();
      member.userid = this.memberuserselect;
      member.channelid = this.channel.id;
      member.groupid = this.groupid;

      return this.channelService.createMember(member).subscribe(
        (data) => {
          this.memberuserselect = "";
        },
        (err: HttpErrorResponse) => {
          console.log("ChannelDetail ERROR LOG: " + err.message); 
        },
        () => {
          this.getChannel(this.channel.id);
        });
    }

  }


  /** Save the group to external storage using API
   * 
   */
  deleteChannelMember(memberid:string) {
    var saved = false;

    return this.channelService.deleteMember(memberid).subscribe(
      (deleted) => { 
        if (deleted) saved = true;
      },
      (err: HttpErrorResponse) => {
        alert("auth.service ERROR LOG: " + err.message); 
      },
      () => {
        if (saved) this.getChannel(this.channel.id);
      });

  }


  setSockets(){
    this.channelService.initSocket();

    //- Observable - Set channel once joined channel
    this.channelService.joinedChannel((channeldata) => {
      this.channel = channeldata;
      this.messages = this.channel.messages;
    });

    this.channelService.notice((result) => {
      this.channelnote = result;
      // this.classdisplay = "show-slow";
    });

    this.channelService.currUsers((result) => {
      this.currusers = result;
      this.countmembers = result.length;
    });

    this.channelService.getMessage((data)=>{
      this.messages.unshift(data);
    });

  }
  
  changeClass() {
    alert('changed');
    this.classdisplay = "show-slow";
  }

}