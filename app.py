import requests
from flask import Flask, jsonify, request ,render_template
import json
from flask_pymongo import PyMongo
from pymongo import MongoClient
import datetime

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"
mongo = PyMongo(app)

urls_data = {
    "Charr Temp Cycle": "http://172.31.6.60:8090/get_all_process_stations_ui/",
    "Mako Shark 4C": "http://172.31.6.62:8090/get_all_process_stations_ui/",
    "Lamprey Temp Cycle": "http://172.31.6.59:8090/get_all_process_stations_ui/",
    # "url5": "http://172.31.6.64:8090/get_all_process_stations_ui/",
    # "url6": "http://172.31.6.999:8090/get_all_process_stations_ui/",  # Bad URL
}

def get_timestamp():
    return datetime.datetime.now()

@app.route('/')
def home():
    successful_urls = []
    for key, url in urls_data.items():
        try:
            response = requests.get(url, timeout=5)  # Set a timeout (e.g., 5 seconds)
            response.raise_for_status()
            data = response.json()
            documents = [
                {
                    "id": station["station_id"],
                    "station_name": station["station_name"],
                    "result": station.get("previous_process_plan_result", ""),  # Handle potential missing key
                    "timestamp": get_timestamp(),
                    "source": key,
                }
                for station in data
            ]
            # Insert documents into a collection named after the URL key
            mongo.db[key].insert_many(documents)
            successful_urls.append(key)

        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from {url}: {e}")

    return "Hello world"

if __name__ == "__main__":
    app.run(debug=True)
