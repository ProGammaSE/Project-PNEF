# author: Hashini Manasha
import flask
from flask import request
from flask_restful import abort
from flask_cors import CORS
import pandas as pd
import joblib
from sklearn import naive_bayes
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import json

app = flask.Flask(__name__)
app.config["DEBUG"] = True

# Allow cross-origin
CORS(app)
cors = CORS(app, resources={
    r"/": {
        "origins": "*"
    }
})


# Function to train the model to predict network equipment failures
@app.route('/pnef/train/model', methods=['POST'])
def train_model():
    print("***** train_model function is starting *****")

    # Define column names
    column_names = ['packets', 'uptime', 'memory', 'issues', 'status']

    try:
        # Load dataset (csv file)
        print("attempting to read the CSV file data (dataset)")
        csv_data = pd.read_csv("PNEF_dataset_2.csv", header=None, names=column_names)
        print("CSV reading successful")

        # Split dataset
        print("Fitting data into the Naive Bayes model")
        feature_columns = ['packets', 'uptime', 'memory', 'issues']
        x = csv_data[feature_columns]
        y = csv_data['status']

        # # 70% training and 30% test
        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.3, random_state=1)

        # # Fit the training datasets into the algorithm
        naive = naive_bayes.MultinomialNB()
        naive.fit(x_train.values, y_train.values)
        print("Naive Bayes model fitted")

        # Save the trained model in a pickle file
        print("Attempting to save the PICKLE file")
        joblib.dump(naive, 'PNEF_Trained_model.pkl')
        print("Model saved successfully")

        # get prediction accuracy
        print("Generating the model accuracy")
        prediction = naive.predict(x_test.values)
        accuracy = round(accuracy_score(y_test, prediction) * 100, 2)
        print("Model Accuracy: ", accuracy, "%")
        print(classification_report(y_test, prediction))

        # Load the existing data from the JSON file where the accuracy is storing
        with open('local_data.json', 'r') as file:
            data = json.load(file)

        data['accuracy'] = str(accuracy) + "%"

        # Write the updated data back to the JSON file where the accuracy is storing
        with open('local_data.json', 'w') as file:
            json.dump(data, file, indent=4)

        obj = {
            "status": 200,
            "description": "PNEF model trained successfully",
        }

    except Exception as e:
        obj = {
            "status": 400,
            "description": "PNEF model training failed!",
        }

        print(e)
        abort(400)

    return obj


# Function to predict network failures by passing Packet loss, Uptime, Memory usage and smaller issues occured
@app.route('/pnef/predict/failure', methods=['POST'])
def predict_failure():
    print("--- predict_failure function is calling ---")

    try:
        # Load Naive Bayes pickle
        naive_joblib = joblib.load('PNEF_Trained_model.pkl')

        # Get input values
        packets = float(request.json['packets'])
        uptime = float(request.json['uptime'])
        memory = float(request.json['memory'])
        issues = float(request.json['issues'])

        # Creating an array using given inputs
        input_array = [packets, uptime, memory, issues]
        print(input_array)

        # Get the prediction using input array
        prediction = naive_joblib.predict([input_array])[0]

        # Load the existing data from the JSON file where the accuracy is stored
        with open('local_data.json', 'r') as file:
            accuracy = json.load(file).get('accuracy')

        # Call the get_prediction_details function get the prediction text and the suggestion list
        result = get_prediction_details(input_array, int(prediction))
        text = result['text']
        print(text)
        # suggestions = get_prediction_details.suggestions

        data = [
            {"prediction": int(prediction)},
            {"text": result['text']},
            {"accuracy": accuracy},
            {"suggestions": result['suggestions']},
        ]
        # data = [int(prediction), get_prediction_text(int(prediction)), accuracy['accuracy']]

        print("Prediction: ", prediction)

        # Creating an object using prediction
        obj = {
            "response": 200,
            "message": "Network equipment failure predicted successfully",
            "data": data
        }
        print(obj)

    except Exception as e:
        obj = {
            "response": 400,
            "message": "Prediction failed",
            "data": {
                "prediction": 0,
                "text": "",
                "accuracy": 0
            }
        }
        print(e)
        abort(400)
    return obj


# Function to get the text of "Failure" or "No Failure" by passing the prediction ID
# Also, to gather suggestions depending on the failure situation
def get_prediction_details(input_array, prediction_id):
    suggestion_array = []

    if prediction_id == 1:
        # If a failure then return suggestions to the user depending on the situation
        # avg max package los = 5.0
        # avg max uptime = 500000
        # avg CPU usage = 75%
        # avg smaller issues = 5

        if input_array[0] > 5.0:
            suggestion_array.append("Check for network congestion and optimize traffic routing.")
            suggestion_array.append("Inspect physical connections (cables, ports) for damage or loose connections.")
            suggestion_array.append("Update firmware or drivers for network interfaces.")
            suggestion_array.append("Monitor for signs of hardware degradation (e.g., overheating, high error rates).")
            suggestion_array.append("Consider replacing the equipment if packet loss persists despite troubleshooting.")

        elif input_array[1] > 500000:
            suggestion_array.append("Schedule a maintenance window to reboot the device and clear any accumulated "
                                    "memory leaks or software glitches.")
            suggestion_array.append("Perform a thorough inspection of hardware components (e.g: fans, power supplies).")
            suggestion_array.append("Update the device's firmware to the latest stable version.")
            suggestion_array.append("Monitor for signs of aging, such as increased CPU usage or slower performance.")

        elif input_array[2] > 74:
            suggestion_array.append("Identify and terminate unnecessary processes or services consuming resources.")
            suggestion_array.append("Optimize configurations to reduce resource usage (e.g., adjust routing tables, "
                                    "limit logging).")
            suggestion_array.append("Upgrade hardware (e.g., add more RAM or replace the CPU) if the device is"
                                    " consistently overloaded")
            suggestion_array.append("Distribute workloads across multiple devices to reduce strain on a single "
                                    "piece of equipment.")

        elif input_array[3] > 5:
            suggestion_array.append("Investigate the root cause of recurring issues (e.g., software bugs, environmental"
                                    " factors).")
            suggestion_array.append("Perform a comprehensive diagnostic test to identify potential hardware or software"
                                    " faults.")
            suggestion_array.append("Replace or upgrade the equipment if smaller issues persist and indicate underlying"
                                    " instability.")
            suggestion_array.append("Increase monitoring frequency to catch and address issues before they escalate.")

        else:
            suggestion_array.append("Use network monitoring tools to track metrics like packet loss, CPU/memory usage,"
                                    " and uptime in real-time.")
            suggestion_array.append("Configure alerts for critical thresholds to enable quick response to potential "
                                    "issues.")
            suggestion_array.append("Ensure all network equipment is running the latest firmware to avoid known bugs or"
                                    " vulnerabilities.")
            suggestion_array.append("Design the network with redundancy to minimize the impact of equipment failures.")
            suggestion_array.append("Schedule regular maintenance to inspect and update equipment.")
            suggestion_array.append("Analyze historical data to identify patterns and predict future failures.")

        obj = {
            "suggestions": suggestion_array,
            "text": "Failure"
        }

    else:
        obj = {
            "suggestions": [],
            "text": "No Failure"
        }

    return obj


app.run(port=5002, debug=True)
