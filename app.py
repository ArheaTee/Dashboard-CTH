import requests
from flask import Flask, jsonify

app = Flask(__name__)

urls_data = {
    "url1" : "http://172.31.6.56:8090/get_all_process_stations_ui/",
    "url2" : "http://172.31.6.60:8090/get_all_process_stations_ui/",
    "url3" :"http://172.31.6.62:8090/get_all_process_stations_ui/",
    # "url4" :"http://172.31.6.59:8090/get_all_process_stations_ui/",
    # "url5" :"http://172.31.6.64:8090/get_all_process_stations_ui/"
}

data_dic ={}
for key, url in urls_data.items():
    response = requests.get(url)
    data_dic[key] = response.json()

@app.route('/')
def home():
    return jsonify(data_dic)

if __name__ == "__main__":
    app.run(debug=True)