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

        print("Prediction: ", prediction)

        # Creating an object using prediction
        obj = {
            "response": 200,
            "message": "Network equipment failure predicted successfully",
            "data": {
                "prediction": int(prediction),
                "text": get_prediction_text(int(prediction))
            }
        }
        print(obj)

    except Exception as e:
        obj = {
            "response": 400,
            "message": "Prediction failed",
            "data": {
                "prediction": 0,
                "text": ""
            }
        }
        print(e)
        abort(400)
    return obj


# Function to get the text of "Failure" or "No Failure" by passing the prediction ID
def get_prediction_text(prediction_id):
    if prediction_id == 1:
        return "Failure"
    else:
        return "No Failure"


app.run(port=5002, debug=True)
