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


# train the model to predict network equipment failures
@app.route('/pnef/train/model', methods=['POST'])
def train_model():
    print("***** train_model function is starting *****")

    # Define column names
    column_names = ['packets', 'uptime', 'memory', 'issues', 'status']

    try:
        # Load dataset (csv file)
        print("attempting to read the CSV file data (dataset)")
        csv_data = pd.read_csv("PNEF_Dataset.csv", header=None, names=column_names)
        print("CSV reading successful")

        # Split dataset
        print("Fitting data into the Naive Bayes model")
        feature_columns = ['packets', 'uptime', 'memory', 'issues']
        X = csv_data[feature_columns]
        Y = csv_data['status']

        # # 70% training and 30% test
        x_train, x_test, y_train, y_test = train_test_split(X, Y, test_size=0.3, random_state=1)

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


# predict network failures
@app.route('/pnef/predict', methods=['POST'])
def predict_failure():
    print("--- predict_failure function is calling ---")

    try:
        # Load Naive Bayes pickle
        naive_joblib = joblib.load('PNEF_Trained_model.pkl')

        # Get input values
        packets = int(request.json['packets'])
        uptime = int(request.json['uptime'])
        memory = int(request.json['memory'])
        issues = int(request.json['issues'])

        # Creating an array using given inputs
        input_array = [packets, uptime, memory, issues]
        print(input_array)

        # Get the prediction using input array
        prediction = naive_joblib.predict([input_array])[0]

        print("Prediction: ", prediction)

        # Creating an object using prediction
        obj = {
            "status": 200,
            "description": "Network equipment failure predicted successfully",
            "prediction": prediction
        }
        print(obj)

    except Exception as e:
        obj = {
            "status": 400,
            "description": "Network equipment failure predicting failed!",
            "prediction": ""
        }
        print(e)
        abort(400)
    return obj


app.run(port=5002, debug=True)
