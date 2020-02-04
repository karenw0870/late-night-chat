import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Group } from '../_models/group';
import { GroupService } from '../_services/group.service';
import { AuthService } from '../_services/auth.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  groups:Group[];
  isSuper:boolean;
  isGroup:boolean;
  currUserId:string;
  currUsername:string;
  superLogin:boolean;
  imagepath:string;

  constructor(private groupService:GroupService, private authService:AuthService,
    private router:Router) { 

      // this.superLogin = false;
      // this.isSuper = this.authService.currIsSuper;
      // this.isGroup = this.authService.currIsGroup;
      // this.currUserId = this.authService.currUserId;
      // this.currUsername = this.authService.currUserName;
      // // this.imagepath = this.authService.currUserImage;
  }

  ngOnInit() {
    
    this.superLogin = false;
    this.isSuper = this.authService.currIsSuper;
    this.isGroup = this.authService.currIsGroup;
    this.currUserId = this.authService.currUserId;
    this.currUsername = this.authService.currUserName;
    this.imagepath = this.authService.currUserImage;

    if (this.currUserId == ""){
      this.router.navigateByUrl('/login');
    } else {
      this.getGroups();
    }

    this.authService.currUser.subscribe(x => {
      this.imagepath = x.imagepath;
      this.imagepath = this.authService.currUserImage;
    });
  }


  ngOnDestroy() {
  }


  getGroups() {
    return this.groupService.getGroups(this.currUserId, this.isSuper).subscribe(
      (data) => {
        this.groups = data['groups'];
      },
      (err: HttpErrorResponse) => {
        console.log("Dashboard ERROR LOG: " + err.message); 
      },
      () => {});
  }

}
