import requests
from flask import Flask, jsonify

url = "http://172.31.6.56:8090/get_all_process_stations_ui/"
response = requests.get(url)
data = response.json()

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)