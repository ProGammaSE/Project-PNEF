import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Users } from '../Models/Users';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  BASE_URL = 'http://127.0.0.1:8082';

  constructor(private http: HttpClient) { }

  // function to connect to the backend and send user registration details
  registerUser(user: Users) {
    return this.http.post(this.BASE_URL + '/user/register', user);
  }

  // function to connect to the backend and send user login details
  loginUser(login: Users) {
    return this.http.post(this.BASE_URL + '/user/login', login);
  }
}
