import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';
import { User } from '../../_models/user';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  userid:string = "";
  user:User;
  isSuper:boolean;
  currUserId:string;

  constructor(private router:Router, private route:ActivatedRoute,
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
  
  
  /** Retrieve a single user record
   * 
   */
  private getUser() {
    return this.userService.getUser(this.userid).subscribe(
      (data) => {
        this.user = data['user'];
      },
      (err: HttpErrorResponse) => {
        console.log("UserDetail ERROR LOG: " + err.message); 
      },
      () => {
      }
      );
  }
}
