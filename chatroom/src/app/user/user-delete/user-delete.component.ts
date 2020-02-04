import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';
import { User } from '../../_models/user';

@Component({
  selector: 'app-user-delete',
  templateUrl: './user-delete.component.html',
  styleUrls: ['./user-delete.component.css']
})
export class UserDeleteComponent implements OnInit {

  userid:string;
  user:User;
  isSuper:boolean;
  result:string;
  currUserId:string;

  constructor(private route:ActivatedRoute, private router:Router, 
    private userService:UserService, private authService:AuthService) { 
    this.user = new User();
    this.isSuper = this.authService.currIsSuper;
    this.currUserId = this.authService.currUserId;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (this.currUserId == ""){
        this.router.navigateByUrl('/login');
      } else {
        this.userid = params.get('id');
        this.getUser();
      }
    });
  }

    
  /** Retrieve a single user record as outlined in snapshot
   */
  private getUser() {
    return this.userService.getUserForUpdate(this.userid).subscribe(
      (data) => {
        this.user = data['user'];
      },
      (err: HttpErrorResponse) => {
        console.log("UserDelete ERROR LOG: " + err.message); 
      },
      () => {
      }
      );
  }


  /** Delete the specified user object
   * @response "true" if deletion successful, otherwise an alert message
   * explaining why deletion was not successful
   */
  deleteUser() {
    var id = this.userid;
    var deleted = false;

    return this.userService.deleteUser(id).subscribe(
      (result) => {
        if (result){
          deleted = true;
        } else {
          alert(result);
        }
      },
      (err: HttpErrorResponse) => {
        console.log("UserDelete ERROR LOG: " + err.message); 
      },
      () => {
        if (deleted == true) this.router.navigateByUrl('/user');
      }
      );
  }

}
