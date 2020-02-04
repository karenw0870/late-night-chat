import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Group } from '../_models/group';
import { GroupAssist } from '../_models/groupassist';
import { User } from '../_models/user';

const GROUP_URL = 'http://localhost:3000/group';
const ASSIST_URL = 'http://localhost:3000/groupassist';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private http:HttpClient) { }

  
  /** UPDATE Group object to API to be edited
   * @usedby GroupEditComponent
   * @param group : Group object to be edited
   * @returns Group object
   */
  updateGroup(group:Group) {
    if (group.id == ""){
      return this.http.post(GROUP_URL + '/create', group); 
    } else {
      return this.http.put(GROUP_URL + '/update', group); 
    }
  }


  /** Retrieve the group details with no related records
   * @usedby GroupEditComponent
   * @params id : Group Id number
   * @returns User object
   */
  getGroupForUpdate(id:string){
    return this.http.get<Group>(GROUP_URL + '/update/' + id);
  }


  /** GET current group credentials from sesion storage
   * @usedby GroupEditComponent, GroupDetailComponent
   * @params id : Group Id number
   * @returns Group object
   */
  getGroup(id:string, curruserid:string, issuper:string){
    return this.http.get<Group>(GROUP_URL + '/detail/', {
      params:{ id:id, curruserid:curruserid, issuper:issuper }
    });
  }


  /** INDEX list of groups
   * @usedby DashboardComponent
   * @params curruserid : User Id of current user
   * @params issuper : True if the current user is a SuperAdmin otherwise False
   * @returns An array of Group objects
   */
  getGroups(curruserid:string, issuper:boolean) {
    return this.http.get<Group[]>(GROUP_URL + '/index', {
      params:{
        curruserid:curruserid.toString(),
        issuper:issuper.toString()
      }
    });
  }
  

  /** DELETE specifed group
   * @usedby GroupDetailComponent
   * @params id : Group Id number to be deleted
   * @returns An array of Group objects
   */
   deleteGroup(id:string){
    return this.http.delete(GROUP_URL + '/delete/' + id);
  }
  

  /** EDIT GroupAssist object to API to be edited
   * @usedby GroupCOmponent
   * @params groupassist : GroupAssist object
   * @returns GroupAssist object
   */
  createGroupAssist(groupassist:GroupAssist) {
    return this.http.post<GroupAssist>(ASSIST_URL + '/create', groupassist);
  }
  

  /** DELETE specifed group
   * @usedby GroupDetailComponent
   * @params id : Group Id number to be deleted
   * @returns An array of Group objects
   */
  deleteGroupAssist(id:string, groupid:string){
    return this.http.delete(ASSIST_URL + '/delete', {
      params:{ id:id, groupid:groupid }
    });
  }

}
