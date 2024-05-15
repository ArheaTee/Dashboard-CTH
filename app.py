import requests
from flask import Flask, jsonify, request 
import json
from flask_pymongo import PyMongo
from pymongo import MongoClient 
import datetime

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"
mongo = PyMongo(app)

urls_data = {
    # "url1" : "https://api.bitkub.com/api/market/ticker",
    "Charr Temp Cycle" :"http://172.31.6.60:8090/get_all_process_stations_ui/",
    "Mako Shark 4C" :"http://172.31.6.62:8090/get_all_process_stations_ui/",
    "Lamprey Temp Cycle" :"http://172.31.6.59:8090/get_all_process_stations_ui/",
    # "url5" :"http://172.31.6.64:8090/get_all_process_stations_ui/",
    # "url6" :"http://172.31.6.65:8090/get_all_process_stations_ui/"
}

data_dic ={}
for key, url in urls_data.items():
    response = requests.get(url)
    data_dic[key] = response.json()
def get_timestamp():
    return datetime.datetime.now()

@app.route('/')
def home():
    for key, url in urls_data.items():
        try:
            response = requests.get(url)
            response.raise_for_status()

            data = response.json()
            documents = [
                {
                    "id": station["station_id"],
                    "station_name": station["station_name"],
                    "resaul": station.get("previous_process_plan_result", ""), # Handle potential missing key
                    "timestamp": get_timestamp(),
                    "source": key
                }
                for station in data
            ]

            # Insert documents into a collection named after the URL key
            mongo.db[key].insert_many(documents)  

        except requests.exceptions.RequestException as e:
            return f"Error fetching data from {url}: {e}", 500

    return "Data insertion complete for all URLs."

if __name__ == "__main__":
    app.run(debug=True)