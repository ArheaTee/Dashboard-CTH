from flask import Flask, render_template
from flask_pymongo import PyMongo
from flask_cors import CORS
import requests
import datetime
from urls import urls_data  # นำเข้า urls_data จาก urls.py
from mongo import save_data_to_mongo  # นำเข้า save_data_to_mongo จาก mongo.py

app = Flask(__name__, static_url_path='/templates', static_folder='templates')
app.config["MONGO_URI"] = "mongodb://localhost:27017/myDatabase"
mongo = PyMongo(app)
CORS(app)

# สร้างฟิลเตอร์เพื่อเอาส่วน 'get_all_process_stations_ui/' ออก
def remove_suffix(url):
    return url.replace('get_all_process_stations_ui/', '')

# ลงทะเบียนฟิลเตอร์ใน Jinja2
app.jinja_env.filters['remove_suffix'] = remove_suffix

@app.route('/')
def home():
    all_data = {}
    for key, url in urls_data.items():
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            all_data[key] = [
                {
                    "id": station["station_id"],
                    "station_name": station["station_name"],
                    "result": station.get("previous_process_plan_result", ""),
                    "display": station.get("elapsed_seconds_for_display"),
                    "source": key,
                }
                for station in data
            ]
            # สร้างสำเนาของข้อมูลที่มี timestamp สำหรับบันทึกใน MongoDB
            data_with_timestamp = [
                {**station_data, "timestamp": datetime.datetime.now()}
                for station_data in all_data[key]
            ]
            # บันทึกข้อมูลไปยัง MongoDB
            save_data_to_mongo(mongo, {key: data_with_timestamp})
        except requests.exceptions.RequestException as e:
            all_data[key] = [{"error": str(e)}]

    # ส่งข้อมูลไปแสดงผลในหน้าเว็บโดยไม่มี timestamp
    return render_template('index.html', data=all_data, urls_data=urls_data)

# @app.route('/history')
# def history():
#     return render_template('history.html')

if __name__ == "__main__":
    app.run(debug=True, port=8001)
