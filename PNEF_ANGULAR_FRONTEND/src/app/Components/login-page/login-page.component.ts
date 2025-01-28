import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CommonModule} from '@angular/common';
import { Users } from '../../Models/Users';
import { UserService } from '../../Services/user.service';
import { GeneralResponse } from '../../Models/GeneralResponse';
import { Router } from '@angular/router';
import { catchError, timeout } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  // global variables
  loadingBox: boolean = false;
  alertStatus: boolean = false;
  alertClass: string = "";
  alertText: string = "";
  login : Users = new Users;
  loggedUser : Users = new Users;
  generalResponse: GeneralResponse = new GeneralResponse;

  constructor(private userService: UserService, private router: Router) {}

  // Function to handle user login
  async loginUser() {
    this.loadingBox = true;
    if (this.login.userUsername == "" || this.login.userPassword == "") {

      // Showing an error message for 3 seconds
      this.loadingBox = false;
      this.alertStatus = true
      this.alertClass = "alert alert-danger"
      this.alertText = "Please enter the username or the password"

      setTimeout(() => {
        this.alertStatus = false
        this.loadingBox = false;
      }, 3000);

    }
    else {
      // Check server timeouts by waiting for 10 seconds
      this.userService.loginUser(this.login).pipe(
        timeout(10000),
        catchError(err => {
          console.log(err)
          this.loadingBox = false;
          this.alertStatus = true
          this.alertClass = "alert alert-danger"
          this.alertText = "Server timeout. Please check your internet"

          setTimeout(() => {
            this.alertStatus = false
            this.loadingBox = false;
          }, 5000);
          return err

        })).subscribe((result: any) => {
          this.generalResponse = result
          this.loggedUser = this.generalResponse.data
          console.log(this.generalResponse)

          // Showing an error message for 5 seconds if the reponse is 200 (success)
          // And then navigates to the next page
          if (this.generalResponse.response == 200) {
            this.alertStatus = true
            this.alertClass = "alert alert-success"
            this.alertText = this.generalResponse.message
            this.loadingBox = true

            setTimeout(() => {
              this.alertStatus = false
              this.loadingBox = false;

              // Saving the logged user details in browser local memory
              localStorage.setItem('user',  JSON.stringify(this.loggedUser));

              // Navigate to the next page
              this.router.navigate(['/navigation'])
            }, 5000);
          }
          else {
            // Showing an error message for 5 seconds if the reponse is not 200 (failure)
            this.loadingBox = false
            this.alertStatus = true
            this.alertClass = "alert alert-danger"
            this.alertText = this.generalResponse.message

            // Clear user fields
            this.login.userUsername = ""
            this.login.userPassword = ""

            setTimeout(() => {
              this.alertStatus = false
            }, 5000);
          }
        });
    }
  }

  // This fucntion works when clicking on the "Not a Member" button in the login page
  // Then navigates to the "register" page
  clickOnNotAMember() {
    // Navigate to the next page
    this.router.navigate(['/register'])
  }

}
