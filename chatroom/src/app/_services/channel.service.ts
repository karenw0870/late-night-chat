import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as io from "socket.io-client";

import { Channel } from '../_models/channel';
import { ChannelMember } from '../_models/member';
import { AuthService } from '../_services/auth.service';

const SERVER_URL = 'http://localhost:3000/channel';
const MEMBER_URL = 'http://localhost:3000/member';
const CHAT_URL = 'http://localhost:3000/chat';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  private socket;

  constructor(private http:HttpClient,
    private authService:AuthService) { 
  }
  
  initSocket():void{
    // Initialises the socket
    this.socket = io(CHAT_URL);
  }


  //-- JOINING
  // SEND: the channelid (joinRoom)
  joinChannel(channelid:string, currusername:string, curruserimage:string){
    this.socket.emit('joinChannel', channelid, currusername, curruserimage);
  }

  // RECEIVE: the channel object (joined)
  joinedChannel(next){
    this.socket.on('joinedChannel', channeldata => next(channeldata));
  }


  // -- MESSAGING
  // SEND: the message entered by the user
  sendMessage(channelid:string, userid:string, username:string, 
    userimage:string, message:string):void {

    this.socket.emit('message', channelid, userid, username, userimage, message);
  }

  // RECEIVE: the message added to add to array
  getMessage(next){
    this.socket.on('message', result => next(result));
  }


  /** Receive any notices sent back from the server */
  notice(next){
    this.socket.on("notice", res => next(res));
  }

  /** Receive list of active users */
  currUsers(next){
    this.socket.on("currusers", res => next(res));
  }

  /** Advise 'server' that user has logged out
   * Server will know if a user is disconnected with clicking 'leave'
   */
  leaveChannel(channelid:string, username:string){
    this.socket.emit('leaveChannel', channelid, username);
  }


  /** Retrieve the current channel credentials from sesion storage
   * @usedby ChannelEditComponent, ChannelDetailComponent
   * @params id : Channel Id number
   * @returns Channel object
   */
  getChannel(channelid:string){
    // Emit - sending to server
    this.socket.emit("joinChannel", channelid);
  }

  
  /** YES. Pass Channel object to API to update channel record
   * @usedby ChannelEditComponent
   * @param channel : Channel object to be edited
   * @returns Channel object
   */
  createChannel(channel:Channel) {
    return this.http.post<Channel>(SERVER_URL + '/create', channel);
  }
 
  /** UPDATE Group object to API to be edited
   * @usedby GroupEditComponent
   * @param group : Group object to be edited
   * @returns Group object
   */
  updateChannel(channel:Channel) {
    return this.http.put(SERVER_URL + '/update', channel); 
  }

  /** Get an index list of channels
   * @usedby ChannelDetailComponent
   * @params id : Channel Id number
   * @returns An array of Channel objects 
   */
  deleteChannel(channel:Channel){
    return this.http.delete(SERVER_URL + '/delete/',{
      params:{ id:channel.id, groupid:channel.groupid }
    });
  }


  /** Pass ChannelMember object to API to update channel member
   * @usedby ChannelDetailComponent
   * @param channel : Member object
   * @returns Channel object
   */
  createMember(member:ChannelMember) {
    return this.http.post<ChannelMember>(MEMBER_URL + '/create', member);
  }


  /** Delete ChannelMember object to API to delete channel member
   * @usedby ChannelComponent
   * @param channel : Member object
   * @returns Channel object
   */
  deleteMember(memberid:string) {
    return this.http.delete(MEMBER_URL + '/delete/' + memberid);
  }


}
