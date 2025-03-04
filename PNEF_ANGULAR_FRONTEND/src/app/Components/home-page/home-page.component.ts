import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { PredictionService } from '../../Services/prediction.service';
import { Prediction } from '../../Models/Prediction';
import { catchError, range, timeout } from 'rxjs';
import { PredictResponse } from '../../Models/PredictResponse';
import { GeneralResponse } from '../../Models/GeneralResponse';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

  // global variables
  loadingBox: boolean = false;
  alertStatus: boolean = false;
  alertClass: string = "";
  alertText: string = "";
  packetValue: number = 0;
  uptimeValue: string = "0 hours";
  cpuUsageValue: string = "0 %";
  issueCountValue: number = 0;
  prediction: Prediction = new Prediction;
  generalResponse: GeneralResponse = new GeneralResponse;
  predictionResult: any = []
  suggesstionArray: any = []
  resultBox: boolean = false;
  suggestionBox: boolean = false;
  resultboxColor: string = "alert alert-success";

  constructor(private predictionService: PredictionService) {}

  // Function to generate random values for predictions [only for testing]
  getRandomValues() {
    // Reset fields before get random values
    // Display the loading icon for 3 seconds
    this.packetValue = 0;
    this.uptimeValue = "0 hours";
    this.cpuUsageValue = "0 %";
    this.issueCountValue = 0;
    this.loadingBox = true;
    this.resultBox = false;
    this.suggestionBox = false;

    setTimeout(() => {
      this.loadingBox = false;

      // For network packets
      const minPacket = 0.001
      const maxPacket = 9.999
      const packetDecimals = 5
      const randomPackets = Math.random() * (maxPacket - minPacket + 1) + minPacket
      this.packetValue = parseFloat(randomPackets.toFixed(packetDecimals));

      // For system uptime
      const minUptime = 0
      const maxUptime = 999999
      const uptimeDecimals = 2
      const randomUptime = Math.floor((Math.random() * (maxUptime - minUptime + 1) + minUptime)) 
      this.uptimeValue = "" + randomUptime + " sec " + "(" + parseFloat((randomUptime / 3600).toFixed(uptimeDecimals)) + " hr)"

      // For CPU usage
      const minCPU = 1.00
      const maxCPU = 100.00
      const cpuDecimals = 2
      const randomCPU = Math.random() * (maxCPU - minCPU + 1) + minCPU
      this.cpuUsageValue = "" + parseFloat(randomCPU.toFixed(cpuDecimals)) + " %";

      // For smaller issue count
      const minIssues = 0
      const maxIssues = 10
      this.issueCountValue = Math.floor((Math.random() * (maxIssues - minIssues + 1) + minIssues)) 
    }, 3000);
  }

  // Function to send the values to the Machine Learning backend and get the prediction
  getPrediction() {
    this.resultBox = false;
    this.suggestionBox = false;
    this.loadingBox = true;
    this.prediction = new Prediction
    this.prediction.packets = this.packetValue
    this.prediction.uptime = parseFloat(this.uptimeValue.split(" ")[0])
    this.prediction.memory = parseFloat(this.cpuUsageValue.replace(' %', ''))
    this.prediction.issues = this.issueCountValue

    this.predictionService.predictFailure(this.prediction)
    // Check server timeouts
    .pipe(
      timeout(10000),
      catchError(err => {
        this.loadingBox = false;
        this.alertStatus = true
        this.alertClass = "alert alert-danger"
        this.alertText = "Server timeout. Please check your internet"

        setTimeout(() => {
          this.alertStatus = false
        }, 2000)

        return err
      })

    // Get and handle Machine Learning backend responses
    ).subscribe((result: any) => {
      this.generalResponse = result;
      this.predictionResult = this.generalResponse.data
      console.log(this.generalResponse)

      if (this.generalResponse.response = 200) {
        this.alertStatus = true
        this.alertClass = "alert alert-success"
        this.alertText = this.generalResponse.message
        console.log(this.generalResponse.data)

        setTimeout(() => {
          // If the result is a NOT-FAILURE then result box color change to GREEN
          // If the result is a FAILURE then result box color change to RED
          console.log(this.predictionResult)
          if (this.predictionResult[1].text == "Failure") {
            this.resultboxColor = "alert alert-danger"

            // Prepare the data for the suggestion box
            this.suggesstionArray = this.predictionResult[3].suggestions
            console.log(this.suggesstionArray)

            // Only make visible the suggestion box if suggestions are available
            if (this.suggesstionArray.length > 0) {
              this.suggestionBox = true;
            }
            else {
              this.suggestionBox = true;
            }

          }
          else {
            this.resultboxColor = "alert alert-success"
          }

          this.alertStatus = false
          this.loadingBox = false
          this.resultBox = true
        }, 2000)
      }
      else {
        this.loadingBox = false
        this.alertStatus = true
        this.alertClass = "alert alert-danger"
        this.alertText = this.generalResponse.message

        setTimeout(() => {
          this.alertStatus = false
        }, 2000)
      }
    })
  }

  //
  resetFields() {
    this.packetValue = 0
    this.uptimeValue = "0";
    this.cpuUsageValue = "0";
    this.issueCountValue = 0;
    this.resultBox = false
  }
}
