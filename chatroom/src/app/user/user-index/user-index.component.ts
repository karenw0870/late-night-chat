import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';
import { User } from '../../_models/user';

@Component({
  selector: 'app-user-index',
  templateUrl: './user-index.component.html',
  styleUrls: ['./user-index.component.css']
})
export class UserIndexComponent implements OnInit {

  users:User[];
  currUserId:string;
  isSuper:boolean;
  isGroup:boolean;

  constructor(private userService:UserService, private authService:AuthService,
    private router:Router) { 

      this.isSuper = this.authService.currIsSuper;
      this.isGroup = this.authService.currIsSuper;
      this.currUserId = this.authService.currUserId;
     
  }

  ngOnInit() {
    if (this.currUserId == ""){
      this.router.navigateByUrl('/login');
    } else {
      this.getUsers();
    }
  }

  
  getUsers() {
    return this.userService.getUsers().subscribe(
      (data) => {
        this.users = data['users'];
      },
      (err: HttpErrorResponse) => {
        console.log("UserIndex ERROR LOG: " + err.message); 
      },
      () => {});
  }


}
