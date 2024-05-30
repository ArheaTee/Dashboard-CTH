from flask import Flask, render_template, request, jsonify
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
    summary, all_data = fetch_data_from_urls()
    return render_template('index.html', summary=summary, data=all_data)

@app.route('/realtime')
def realtime():
    family = request.args.get('family', 'all')
    summary, all_data = fetch_data_from_urls(family)
    return render_template('realtime.html', data=all_data, summary=summary, urls_data=urls_data)

@app.route('/realtime_data')
def realtime_data():
    family = request.args.get('family', 'all')
    summary, all_data = fetch_data_from_urls(family)
    return jsonify({"summary": summary, "stations": all_data})

@app.route('/history')
def history():
    return render_template('history.html')

def fetch_data_from_urls(family='all'):
    all_data = {}
    summary = {group: {"online": 0, "offline": 0, "test": 0, "pass": 0, "fail": 0, "abort": 0} for group in urls_data}

    if family == 'all':
        groups = urls_data.keys()
    else:
        groups = [family]

    for group in groups:
        all_data[group] = {}
        for key, url in urls_data[group].items():
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
                        "url": url
                    }
                    for station in data
                ]
                data_with_timestamp = [
                    {**station_data, "timestamp": datetime.datetime.now()}
                    for station_data in all_data[group][key]
                ]
                save_data_to_mongo(mongo, {key: data_with_timestamp})
                summary[group]["online"] += 1
            except requests.exceptions.RequestException as e:
                all_data[group][key] = [{"error": str(e), "url": url}]
                summary[group]["offline"] += 1

    calculate_summary(all_data, summary)
    return summary, all_data

def calculate_summary(data, summary):
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

    return summary

if __name__ == "__main__":
    app.run(debug=True, port=8001)
