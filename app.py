import requests
from flask import Flask, render_template
from flask_pymongo import PyMongo
import datetime
from flask_cors import CORS


app = Flask(__name__, static_url_path='/templates', static_folder='templates')
app.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"  # กำหนด URI ของ MongoDB
mongo = PyMongo(app)
CORS(app)

urls_data = {
    "Charr Temp Cycle": "http://172.31.6.60:8090/get_all_process_stations_ui/",
    "Lamprey Temp Cycle": "http://172.31.6.54:8090/get_all_process_stations_ui/",
    "Mako Shark 4C": "http://172.31.6.55:8090/get_all_process_stations_ui/",
    # "Lamprey Temp Cycle": "http://172.31.6.59:8090/get_all_process_stations_ui/",
}

def get_timestamp():
    return datetime.datetime.now()

@app.route('/')
def home():
    successful_urls = []
    results = []
    for key, url in urls_data.items():
        try:
            response = requests.get(url, timeout=5)  
            response.raise_for_status()
            data = response.json()
            documents = [
                {
                    "id": station["station_id"],
                    "station_name": station["station_name"],
                    "result": station.get("previous_process_plan_result", ""),
                    "timestamp": get_timestamp(),
                    "source": key,
                }
                for station in data
            ]

            # Update or insert data into MongoDB
            for station_data in documents:
                filter_query = {"id": station_data["id"], "source": key}
                update_data = {"$set": station_data}
                mongo.db[key].update_one(filter_query, update_data, upsert=True)

            successful_urls.append(key)

        except requests.exceptions.RequestException as e:
            results.append((key, f"Error: {e}", 0))

    # Retrieve the latest and unique data from MongoDB
    all_data = {}
    for collection_name in successful_urls:
        pipeline = [
            {"$sort": {"timestamp": -1}},
            {"$group": {"_id": {"id": "$id", "source": "$source"}, "data": {"$first": "$$ROOT"}}},
            {"$replaceRoot": {"newRoot": "$data"}},
            {"$project": {"_id": 0}},
            {"$sort": {"id": 1}}  # เพิ่มการเรียงลำดับตาม id
        ]
        all_data[collection_name] = list(mongo.db[collection_name].aggregate(pipeline))

    return render_template('index.html', data=all_data)

if __name__ == "__main__":
    app.run(debug=True, port=8001)