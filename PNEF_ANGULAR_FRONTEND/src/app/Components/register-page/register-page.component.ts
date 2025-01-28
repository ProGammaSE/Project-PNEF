import { Component } from '@angular/core';
import { GeneralResponse } from '../../Models/GeneralResponse';
import { Users } from '../../Models/Users';
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { catchError, timeout } from 'rxjs';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {

    // global variables
    loadingBox: boolean = false;
    alertStatus: boolean = false;
    alertClass: string = "";
    alertText: string = "";
    confirmPassword: string = "";
    register : Users = new Users;
    loggedUser : Users = new Users;
    generalResponse: GeneralResponse = new GeneralResponse;

    constructor (private userService: UserService, private router: Router) {}

    // Function to register an user
    registerUser() {
      this.loadingBox = true;
      if (this.register.fullName == "" || this.register.userUsername == "" || this.register.userPassword == "" || this.confirmPassword == "") {
        // Showing an error message for 3 seconds
        this.loadingBox = false;
        this.alertStatus = true
        this.alertClass = "alert alert-danger"
        this.alertText = "Mandatory details cannot be empty"

        setTimeout(() => {
          this.alertStatus = false
          this.loadingBox = false;
        }, 3000);
      }
      else if (this.register.userPassword != this.confirmPassword) {
        // Showing an error message for 3 seconds
        this.loadingBox = false;
        this.alertStatus = true
        this.alertClass = "alert alert-danger"
        this.alertText = "Passwords do not match"
        this.confirmPassword = ""

        setTimeout(() => {
          this.alertStatus = false
          this.loadingBox = false;
        }, 3000);
      }
      else {
        this.userService.registerUser(this.register).pipe(
          timeout(10000),
          catchError(err => {
            return err;
          })
        ).subscribe ((result: any) => {
          this.generalResponse = result
          if (this.generalResponse.response == 200) {
            // Showing an error message for 3 seconds
            this.loadingBox = false;
            this.alertStatus = true
            this.alertClass = "alert alert-success"
            this.alertText = this.generalResponse.message

            // Saving the logged user details in browser local memory
            localStorage.setItem('user',  JSON.stringify(this.loggedUser));

            setTimeout(() => {
              this.alertStatus = false
              this.loadingBox = false;
              this.register = new Users()
              this.router.navigate(['/navigation/home'])
            }, 3000);
          }
          else {
          // Showing an error message for 3 seconds
          this.loadingBox = false;
          this.alertStatus = true
          this.alertClass = "alert alert-danger"
          this.alertText = this.generalResponse.message
          this.register = new Users()

          setTimeout(() => {
            this.alertStatus = false
            this.loadingBox = false;
          }, 3000);
          }
            })
      }
    }

    // Function to navigate the user to Login page
    alreadyRegistered() {
      this.router.navigate(['/login'])
    }

}
