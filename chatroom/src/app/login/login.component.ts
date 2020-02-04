import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../_services/auth.service';
import { UserService } from '../_services/user.service';
import { User } from '../_models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  valid:boolean;
  validation:string;
  username:string;
  password:string;
  numsuper:number;

  constructor(private router:Router,
    private authService:AuthService, private userService:UserService) { 

      this.username = "";
      this.password = "";
      this.valid = true;

      if (this.authService.isAuth){
        this.router.navigateByUrl('dashboard');
      }
    }

  ngOnInit() {
    //- Check if no users - add the first Super user if no users

    this.userService.findSuper().subscribe(
      (value) => {
        this.numsuper = parseInt(value['count']);
      },
      (error) => {

      },
      () => {
        if (this.numsuper < 1) {
          // add first user
          var firstuser = new User();
          firstuser.username = 'Super';
          firstuser.securitylevel = 'super';
          firstuser.password = 'super';

          this.userService.updateUser(firstuser).subscribe(
            (saved) => { 
              if (saved['result'] == ''){
                alert('Super user was unable to be created.');
              } else {
                alert('The Super User has been created.');
              }
            },
            () => {
              
          });
        }
      }
    );
  }


  /** Retrieve response if logged in user true credentials by API
   * @usedfor Login button
   * @response Json {"valid":true}
   */
  userLogin() {
    let loginobj = {
      "username":this.username,
      "password":this.password
    };

    return this.authService.userLogin(loginobj).subscribe(
      (data:any) => {
        if (data.valid){
          this.authService.setLoggedInUser(data.user);
        } else {
          this.valid = false;
          this.validation = "Invalid user credentials";
          alert(data.error);
        }
      },
      (err: HttpErrorResponse) => {
        console.log("Login ERROR LOG: " + err.message); 
      },
      () => {
      });
  }

}
