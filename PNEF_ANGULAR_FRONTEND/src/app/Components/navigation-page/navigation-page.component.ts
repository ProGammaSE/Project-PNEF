import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { Users } from '../../Models/Users';

@Component({
  selector: 'app-navigation-page',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './navigation-page.component.html',
  styleUrl: './navigation-page.component.css'
})
export class NavigationPageComponent implements OnInit {

  // Global variables
  isAdmin: boolean = false;
  loggedUser: Users = new Users;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Show the Admin section only if a Admin user logged in to the system
    const user = localStorage.getItem('user');
    this.loggedUser = user ? JSON.parse(user) : null;

    if (this.loggedUser == null) {
      this.router.navigate(['/welcome'])
    }
    
    else if (this.loggedUser.userRole == 1) {
      console.log("User is a Admin user")
      this.isAdmin = true;
    }
    else {
      console.log("User is a normal user")
    }
  }

  // Function to handle user Logouts and clear saved user details
  userLogout() {
    // Removing the logged user details from browser local memory
    localStorage.removeItem('user');
  }
}
