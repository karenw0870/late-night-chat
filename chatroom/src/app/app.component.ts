import { Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './_services/auth.service';
import { User } from './_models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  isAuth:boolean;
  userName:string;
  curruser:User;

  constructor(private router:Router, private authService:AuthService) { 
  }

  ngOnInit() {
    this.isAuth = this.authService.isAuth;
    
    this.authService.currUser.subscribe(x => {
      this.curruser = x;
      this.isAuth = this.authService.isAuth;
      if (x == null){
        this.userName = "";
      } else {
        this.userName = x.username;
      }
    });
  }


  /** Reset all variables back to default
   * Use authService to clear all sessionStorage
   * Navigate back to login page
   */
  signOut(){
    this.userName = "";
    this.isAuth = false;
    this.authService.userLogout();
    this.router.navigateByUrl('login');
  }


}
