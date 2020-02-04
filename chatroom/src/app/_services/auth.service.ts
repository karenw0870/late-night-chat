import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../_models/user';

const SERVER_URL = 'http://localhost:3000/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currUserSubject:BehaviorSubject<User>;
  public currUser:Observable<User>
  loginready:false;
  numusers:number;

  constructor(private http:HttpClient, private router:Router) { 
    this.currUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('user')));
    this.currUser = this.currUserSubject.asObservable();  
  }

  canActivate(state: RouterStateSnapshot) {
    if (sessionStorage.getItem("username")) {
      var newuser = new User();
      newuser.id = sessionStorage.getItem("userid");
      newuser.username = sessionStorage.getItem("username");
      newuser.imagepath = sessionStorage.getItem("userimage");
      newuser.securitylevel = sessionStorage.getItem("securitylevel");
      this.currUserSubject.next(newuser);

      return true;
    } else {
      this.router.navigateByUrl('/login');
      return false;
    }
  }

  //--- PROPERTIES ---

  public get isAuth():boolean{
    if (sessionStorage.getItem("userid")){
      return true;
    } else {
      return false;
    }
  }

  public get currUserName():string{
    if (sessionStorage.getItem("username")){
      return sessionStorage.getItem('username');
    } else {
      return '';
    }
  }

  public get currUserImage():string{
    if (sessionStorage.getItem("userimage")){
      return sessionStorage.getItem('userimage');
    } else {
      return "http://localhost:3000/userimages/default.png";
    }
    
  }

  public get currUserId():string{
    if (sessionStorage.getItem("userid")){
      return sessionStorage.getItem('userid');
    } else {
      return '';
    }
  }


  /** True if the current logged in user is the
   * 'SUPER' login user
   */
  public get superLogin():boolean{

    var superlogin = sessionStorage.getItem("superlogin");

    if (superlogin == "true"){
      return true;
    } else {
      return false;
    }
  }


  public get currIsSuper():boolean{

    var issuper = sessionStorage.getItem("issuper");

    if (issuper == "true"){
      return true;
    } else {
      return false;
    }
  }


  public get currIsGroup():boolean{

    var isgroup = sessionStorage.getItem("isgroup");

    if (isgroup == "true"){
      return true;
    } else {
      return false;
    }
  }


  //--- METHODS ---

  addDummyData() {
    return this.http.get(SERVER_URL + '/dummydata');
  }

  /** Pass User object to API to retrieve full record details
   * @usedby LoginComponent
   * @param userpwd User, password object {username:m, password:m}
   * @returns Json {"valid":true} is user valid, otherwise false
   */
  userLogin(loginobj:any) {
    return this.http.post<User>(SERVER_URL, loginobj);
  }


  /** User object saved to session storage
   * @usedby LoginComponent
   * @param User object
   * @returns route to UserIndex if Super otherwise Dashboard
   */
  setLoggedInUser(data:any) {

    var securitylevel = data.securitylevel;
    var username = data.username;

    var newuser = new User();
    newuser.id =  data.id;
    newuser.username =  username;
    newuser.email =  data.email;
    newuser.image =  data.image;
    newuser.imagepath = data.imagepath;
    newuser.securitylevel =  securitylevel;

    this.setSessionStorage(newuser);

    if (this.currIsSuper){
      this.router.navigateByUrl('/user');
    } else {
      this.router.navigateByUrl('dashboard');
    }

  }


  /** Stores the current user information in session storage
   * @param user: A User object
   */
  setSessionStorage(user:User){
    sessionStorage.setItem("userid", user.id);
    sessionStorage.setItem("securitylevel", user.securitylevel);
    sessionStorage.setItem("username", user.username);
    sessionStorage.setItem("userimage", user.imagepath);

    if (user.username.toUpperCase() == "SUPER"){
      sessionStorage.setItem("superlogin", "true");
    } else {
      sessionStorage.setItem("superlogin", "false");
    }

    if (user.securitylevel == "super"){
      sessionStorage.setItem("issuper", "true");
    } else {
      sessionStorage.setItem("issuper", "false");
    }

    if (user.securitylevel == "group" || user.securitylevel == "super"){
      sessionStorage.setItem("isgroup", "true");
    } else {
      sessionStorage.setItem("isgroup", "false");
    }

    this.currUserSubject.next(user);
  }


  /** Remove all settings from session storage when the user logs out
   * @usedby AppComponent
   */
  userLogout(){
    // sessionStorage.removeItem("user");
    sessionStorage.removeItem("userid");
    sessionStorage.removeItem("securitylevel");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("isgroup");
    sessionStorage.removeItem("issuper");
    sessionStorage.removeItem("superlogin");
    this.currUserSubject.next(null);
  }

}
