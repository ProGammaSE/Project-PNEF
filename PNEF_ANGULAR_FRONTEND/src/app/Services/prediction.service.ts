import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Prediction } from '../Models/Prediction';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {

  private BASE_URL = 'http://127.0.0.1:5002';
  
  constructor(private http: HttpClient) { }

  // function to connect to the backend and send user registration details
  predictFailure(prediction: Prediction) {
    return this.http.post(this.BASE_URL + '/pnef/predict/failure', prediction);
  }
}
