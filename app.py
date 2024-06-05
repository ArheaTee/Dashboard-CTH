from flask import Flask, render_template, request, jsonify, make_response, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS
import requests
import datetime
from concurrent.futures import ThreadPoolExecutor
from urls import urls_data
from mongo import save_data_to_mongo

app = Flask(__name__, static_folder='templates')
app.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"
mongo = PyMongo(app)
CORS(app)

def remove_suffix(url):
    return url.replace('get_all_process_stations_ui/', '')

app.jinja_env.filters['remove_suffix'] = remove_suffix

@app.route('/')
def home():
    summary, all_data = fetch_data_from_urls()
    response = make_response(render_template('index.html', summary=summary, data=all_data))
    response.headers['Cache-Control'] = 'public, max-age=3600'  # 1 hour
    return response

@app.route('/realtime')
def realtime():
    family = request.args.get('family', 'all')
    summary, all_data = fetch_data_from_urls(family)
    response = make_response(render_template('realtime.html', data=all_data, summary=summary, urls_data=urls_data))
    response.headers['Cache-Control'] = 'public, max-age=3600'  # 1 hour
    return response

@app.route('/realtime_data')
def realtime_data():
    family = request.args.get('family', 'all')
    summary, all_data = fetch_data_from_urls(family)
    return jsonify({"summary": summary, "stations": all_data})

@app.route('/history')
def history():
    response = make_response(render_template('history.html'))
    response.headers['Cache-Control'] = 'public, max-age=3600'  # 1 hour
    return response

@app.route('/templates/<path:filename>')
def custom_static(filename):
    response = make_response(send_from_directory('templates', filename))
    response.headers['Cache-Control'] = 'public, max-age=2592000'  # 30 days
    return response

def fetch_url_data(group, key, url):
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        stations = [
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
            for station_data in stations
        ]
        save_data_to_mongo(mongo, {key: data_with_timestamp})
        return key, stations, None
    except requests.exceptions.RequestException as e:
        return key, [], str(e)

def fetch_data_from_urls(family='all'):
    all_data = {}
    summary = {group: {"online": 0, "offline": 0, "test": 0, "pass": 0, "fail": 0, "abort": 0} for group in urls_data}

    if family == 'all':
        groups = urls_data.keys()
    else:
        groups = [family]

    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {
            executor.submit(fetch_url_data, group, key, url): (group, key)
            for group in groups for key, url in urls_data[group].items()
        }

        for future in future_to_url:
            group, key = future_to_url[future]
            key, stations, error = future.result()
            if error:
                all_data.setdefault(group, {})[key] = [{"error": error, "url": urls_data[group][key]}]
                summary[group]["offline"] += 1
            else:
                all_data.setdefault(group, {})[key] = stations
                summary[group]["online"] += 1

    calculate_summary(all_data, summary)
    return summary, all_data

def calculate_summary(data, summary):
    for group, stations in data.items():
        for key, station_data in stations.items():
            for station in station_data:
                if "error" not in station:
                    summary[group]["test"] += 1
                    if station["result"] == "PASSED":
                        summary[group]["pass"] += 1
                    elif station["result"] == "FAILED":
                        summary[group]["fail"] += 1
                    elif station["result"] == "ABORTED":
                        summary[group]["abort"] += 1

    return summary

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8001)
