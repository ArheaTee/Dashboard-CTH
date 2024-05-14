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
    "url2" : "http://172.31.6.60:8090/get_all_process_stations_ui/",
    # "url3" :"http://172.31.6.62:8090/get_all_process_stations_ui/",
    # "url4" :"http://172.31.6.59:8090/get_all_process_stations_ui/",
    # "url5" :"http://172.31.6.64:8090/get_all_process_stations_ui/"
    # "url6" : "http://172.31.6.65:8090/get_all_process_stations_ui/"
}

data_dic ={}
for key, url in urls_data.items():
    response = requests.get(url)
    data_dic[key] = response.json()

def get_timestamp():
  return datetime.datetime.now()

@app.route('/')
def home():
    if response.status_code == 200:
        # Parse the JSON response
        data1 = json.loads(response.text)
        
        # Create a list of documents
        documents = []
        for station_id in data1[:11]:
            # เพิ่ม timestamp ให้กับเอกสารแต่ละรายการ
            documents.append(
                {"id": station_id["station_id"], 
                 "timestamp": get_timestamp()})

        # Insert multiple documents
        mongo.db.invention.insert_many(documents)
        return f"Successfully inserted {len(documents)} documents!"

if __name__ == "__main__":
    app.run(debug=True)
