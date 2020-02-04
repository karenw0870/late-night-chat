import { Component, OnInit, ɵConsole } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';
import { User } from '../../_models/user';
import { callbackify } from 'util';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  user:User;
  userid:string;
  selectedfile:any = null;
  // imagepath = "";
  enterpassword:string;
  confirmpassword:string;
  changepassword:boolean;

  isSuper:boolean;
  isGroup:boolean;
  currUserId:string;

  constructor(private router:Router, private route:ActivatedRoute,
    private authService:AuthService, private userService:UserService) { 
      
    this.user = new User();
    this.userid = "";
    this.enterpassword = "";
    this.confirmpassword = "";
    this.changepassword = false;
    this.selectedfile = null;

    this.isSuper = this.authService.currIsSuper;
    this.isGroup = this.authService.currIsGroup;
    this.currUserId = this.authService.currUserId;

  }


  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (this.currUserId == ""){
        this.router.navigateByUrl('/login');
      } else {
        this.userid = params.get('id');
        if (this.userid == null){
          this.userid = "";
          this.changepassword = true;
        } else {
          this.getUser();
        }
      }
    });
  }

  
  /** Retrieve a single user record
   */
  private getUser(updateStorage:boolean = false) {

    if (this.userid != ""){

      this.userService.getUserForUpdate(this.userid).subscribe(
        (data) => {
          this.user = data['user'];
          if (updateStorage == true) this.authService.setSessionStorage(this.user);
        },
        (err: HttpErrorResponse) => {
          console.log("UserEdit ERROR LOG: " + err.message); 
        });
    }
    
  }


  /** Save the user to external storage using API
   */
  updateUser() {

    var continueUpdate:boolean = true;

    if (this.changepassword == true){
      if (this.enterpassword != this.confirmpassword){
        alert("The entered passwords do not match. Try again.");
        continueUpdate = false;
      } else {
        if (this.enterpassword == '' || this.confirmpassword == ''){
          alert("You must enter a password and confirm.");
          continueUpdate = false;
        } else {
          this.user.password = this.enterpassword;
        }
      }
    }

    if (continueUpdate){
      var usersaved = false;

      return this.userService.updateUser(this.user).subscribe(
        (data) => { 
          if (data['result'] != "") usersaved = true;
        },
        (err: HttpErrorResponse) => {
          alert("auth.service ERROR LOG: " + err.message); 
        },
        () => {
          if (usersaved) {
            if (this.user.id == this.authService.currUserId) {
              this.getUser(true);
            } 
            
            this.router.navigateByUrl('/user/detail/' + this.user.id);          
          }
        });
    }

  }


  /** On click method to display the fields to update the password
   * Changes 'changepassword' to true
   */
  changePassword(){
    this.changepassword = true;
  }


  /** On click method to hide the update password fields
   * Changes 'changepassword' to false
   */
  cancelChange(){
    this.changepassword = false;
  }


  onImageSelect(event:any) {
    if (event.target.files[0] != null){
      this.selectedfile = event.target.files[0]
    } else {
      this.selectedfile = null;
    }
  }


  uploadImage(){
    if (this.selectedfile != null){
      const fd = new FormData();
      fd.append('image',this.selectedfile, this.selectedfile.name);

      this.userService.imageUpload(fd).subscribe( 
        (result:any) => {
          this.user.image = result.filename;
      }, 
      (err) => {},
      () => { this.updateUser();});

    } else {
      this.updateUser();
    }

  }

}

