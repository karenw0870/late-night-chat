import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../_services/auth.service';
import { GroupService } from '../../_services/group.service';
import { UserService } from '../../_services/user.service';
import { Group } from '../../_models/group';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.css']
})
export class GroupEditComponent implements OnInit {

  groupid:string;
  group:Group;
  confirmpassword:string;
  result:string;
  userselect:UserSelect[] = [];

  isSuper:boolean;
  isGroup:boolean;
  currUserId:string;

  constructor(private router:Router, 
    private route:ActivatedRoute,
    private groupService:GroupService,
    private authService:AuthService, 
    private userService:UserService) { 

      this.groupid = "";
      this.group = new Group();
      this.confirmpassword = "";
      this.result = "";      
      this.isSuper = this.authService.currIsSuper;
      this.isGroup = this.authService.currIsSuper;
      this.currUserId = this.authService.currUserId;

    }

    
  ngOnInit() {
    this.userService.getUserSelect().subscribe(
      (data:[]) => {
        this.userselect = data['users'];
      });

    this.route.paramMap.subscribe(params => {
      if (this.currUserId == ""){
        this.router.navigateByUrl('/login');
      } else {
        this.groupid = params.get('id');
        if (this.groupid == null){
          this.groupid = "";
        } else {
          this.getGroup();
        }
      }
    });
  }

  
  /** Retrieve a single group record
   * 
   */
  private getGroup() {
    if (this.groupid != ""){
      return this.groupService.getGroupForUpdate(this.groupid).subscribe(
        (data) => {
          this.group = data['group'];
        },
        (err: HttpErrorResponse) => {
          console.log("GroupEdit ERROR LOG: " + err.message); 
        },
        () => {
        });
    }
  }

  
  /** Save the group to external storage using API
   * 
   */
  updateGroup() {
    if (this.group.groupadminid == null || this.group.groupadminid == ""){
      this.group.groupadminid = this.currUserId;
    }

    var groupsaved = false

    return this.groupService.updateGroup(this.group).subscribe(
      (saved) => { 
        if (saved) groupsaved = true;
      },
      (err: HttpErrorResponse) => {
        alert("auth.service ERROR LOG: " + err.error); 
      },
      () => {
        if (groupsaved) this.router.navigateByUrl('/dashboard');
      });

  }

 
}
