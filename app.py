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
    all_data, offline_urls = fetch_data_from_urls()
    summary = calculate_summary(all_data, offline_urls)
    return render_template('index.html', summary=summary, data=all_data)

@app.route('/realtime')
def realtime():
    all_data, offline_urls = fetch_data_from_urls()
    summary = calculate_summary(all_data, offline_urls)
    return render_template('realtime.html', data=all_data, summary=summary, urls_data=urls_data)

@app.route('/history')
def history():
    return render_template('history.html')

def fetch_data_from_urls():
    all_data = {}
    offline_urls = set(urls_data.keys())
    for key, url in urls_data.items():
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            all_data[key] = [
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
                for station_data in all_data[key]
            ]
            save_data_to_mongo(mongo, {key: data_with_timestamp})
            offline_urls.remove(key)
        except requests.exceptions.RequestException as e:
            all_data[key] = [{"error": str(e)}]
    return all_data, offline_urls

def calculate_summary(data, offline_urls):
    summary = {
        "online": 0,
        "offline": len(offline_urls),
        "test": 0,
        "pass": 0,
        "fail": 0,
        "abort": 0
    }

    for key, stations in data.items():
        online = False
        for station in stations:
            if "error" not in station:
                online = True
                summary["test"] += 1
                if station["result"] == "PASSED":
                    summary["pass"] += 1
                elif station["result"] == "FAILED":
                    summary["fail"] += 1
                elif station["result"] == "ABORTED":
                    summary["abort"] += 1
        if online:
            summary["online"] += 1

    return summary

if __name__ == "__main__":
    app.run(debug=True, port=8001)
