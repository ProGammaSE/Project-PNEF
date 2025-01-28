import { Component, OnInit } from '@angular/core';
import { Users } from '../../Models/Users';
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GeneralResponse } from '../../Models/GeneralResponse';
import { timeout, catchError } from 'rxjs';
import { UserService } from '../../Services/user.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent  implements OnInit {

  // global variables
  loadingBox: boolean = false;
  alertStatus: boolean = false;
  alertClass: string = "";
  alertText: string = "";
  confirmPassword: string = "";
  loggedUser : Users = new Users;
  generalResponse: GeneralResponse = new GeneralResponse;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    // Get the logged user details to fill the form
    const user = localStorage.getItem('user');
    this.loggedUser = user ? JSON.parse(user) : null;

    console.log(this.loggedUser)

    if (this.loggedUser == null) {
      this. alertStatus = true;
      this.alertClass = "alert alert-danger"
      this.alertText = "Details are not available to show. Please login again!";
    }
  }

  //
  updateProfile() {
    this.loadingBox = true;
          if (this.loggedUser.fullName == "" || this.loggedUser.userUsername == "" || this.loggedUser.userPassword == "") {
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
          else if (this.loggedUser.userPassword != this.confirmPassword) {
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
            this.userService.editUser(this.loggedUser).pipe(
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
                  this.loggedUser = new Users()
                  this.router.navigate(['/navigation/home'])
                }, 3000);
              }
              else {
              // Showing an error message for 3 seconds
              this.loadingBox = false;
              this.alertStatus = true
              this.alertClass = "alert alert-danger"
              this.alertText = this.generalResponse.message
              this.loggedUser = new Users()
    
              setTimeout(() => {
                this.alertStatus = false
                this.loadingBox = false;
              }, 3000);
              }
                })
          }
  }

}
