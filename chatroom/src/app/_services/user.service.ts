import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from '../_models/user';
import { identifierModuleUrl } from '@angular/compiler';

const SERVER_URL = 'http://localhost:3000/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  constructor(private http:HttpClient) { 

  }


  /** Get an index list of users
   * @usedby UsersComponent
   * @returns An array of User objects
   */
  getUsers() {
    return this.http.get<User[]>(SERVER_URL + '/index');
  }

  
  /** Get the total number of users
   * @usedby LoginComponent
   * @returns Number of users as 'number'
   */
  userCount() {
    return this.http.get<number>(SERVER_URL + '/count');
  }

  findSuper() {
    return this.http.get<number>(SERVER_URL + '/findsuper');
  }
  
  /** Pass User object to API to create a new user record
   * @usedby UserComponent
   * @param user : User object to be edited
   * @returns User object
   */
  updateUser(user:User) {
    if (user.id == ""){
      return this.http.post(SERVER_URL + '/create', user); 
    } else {
      return this.http.put(SERVER_URL + '/update', user); 
    }
       
  }


  /** Retrieve the current user details from sesion storage
   * @usedby UserDetailComponent, UserEditComponent, UserDeleteComponent
   * @params id : User Id number
   * @returns User object
   */
  getUserForUpdate(id:string){
    return this.http.get<User>(SERVER_URL + '/update/' + id);
  }


  /** Retrieve the specified user details 
   * @usedby UserDetailComponent
   * @params id : User Id number
   * @returns User object
   */
  getUser(id:string){
    return this.http.get<User>(SERVER_URL + '/detail/' + id);
  }

  

  /** Sends Id of User to be deleted 
   * @usedby UserDeleteComponent
   * @params id : User Id to be deleted
   * @returns A string; 'true' if deleted otherwise the error as a string
   */
  deleteUser(id:string){
    return this.http.delete(SERVER_URL + '/delete/' + id);
  }


  /** Retrieve user select list
   * @usedby GroupComponent, ChannelComponent
   * @returns Array of UserSelect objects (only Id and Name)
   */
  getUserSelect() {
    return this.http.get(SERVER_URL + '/selection');
  }


  // getImage(userid:string){
  //   return this.http.get(SERVER_URL + '/upload/' + userid);
  // }

  imageUpload(formdata:any){
    console.log('image upload');
    return this.http.post<any>(SERVER_URL + '/upload', formdata);
  }

  saveUpload(userid:string, filename:string){
    console.log('save upload');
    let imageinfo = {'id':userid, 'filename':filename};
    return this.http.post(SERVER_URL + '/saveupload', imageinfo);
  }


}
