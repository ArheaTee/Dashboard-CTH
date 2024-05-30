from flask import Flask, render_template
from flask_pymongo import PyMongo
from flask_cors import CORS
import requests
import datetime
from urls import urls_data
from mongo import save_data_to_mongo

app = Flask(__name__, static_url_path='/templates', static_folder='templates')
app.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"
mongo = PyMongo(app)
CORS(app)

def remove_suffix(url):
    return url.replace('get_all_process_stations_ui/', '')

app.jinja_env.filters['remove_suffix'] = remove_suffix

@app.route('/')
def home():
    all_data = fetch_data_from_urls()
    summary = calculate_summary(all_data)
    return render_template('index.html', summary=summary, data=all_data)

@app.route('/realtime')
def realtime():
    all_data = fetch_data_from_urls()
    summary = calculate_summary(all_data)
    return render_template('realtime.html', data=all_data, summary=summary, urls_data=urls_data)

@app.route('/history')
def history():
    return render_template('history.html')

def fetch_data_from_urls():
    all_data = {}
    for group, urls in urls_data.items():
        all_data[group] = {}
        for key, url in urls.items():
            try:
                response = requests.get(url, timeout=5)
                response.raise_for_status()
                data = response.json()
                all_data[group][key] = [
                    {
                        "id": station["station_id"],
                        "station_name": station.get("station_name", "unknown"),
                        "result": station.get("previous_process_plan_result", ""),
                        "display": station.get("elapsed_seconds_for_display", "unknown"),
                        "current_status": station.get("current_status"),
                        "current_station_status": station.get("current_station_status"),
                        "source": key,
                    }
                    for station in data
                ]
                data_with_timestamp = [
                    {**station_data, "timestamp": datetime.datetime.now()}
                    for station_data in all_data[group][key]
                ]
                save_data_to_mongo(mongo, {key: data_with_timestamp})
            except requests.exceptions.RequestException as e:
                all_data[group][key] = [{"error": str(e)}]
    return all_data

def calculate_summary(data):
    summary = {group: {"online": 0, "offline": 0, "test": 0, "pass": 0, "fail": 0, "abort": 0} for group in urls_data}

    for group, stations in data.items():
        for key, station_data in stations.items():
            online = False
            for station in station_data:
                if "error" not in station:
                    online = True
                    summary[group]["test"] += 1
                    if station["result"] == "PASSED":
                        summary[group]["pass"] += 1
                    elif station["result"] == "FAILED":
                        summary[group]["fail"] += 1
                    elif station["result"] == "ABORTED":
                        summary[group]["abort"] += 1
            if online:
                summary[group]["online"] += 1
            else:
                summary[group]["offline"] += 1
    return summary

if __name__ == "__main__":
    app.run(debug=True, port=8001)
