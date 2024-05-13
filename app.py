import requests
from flask import Flask, jsonify

app = Flask(__name__)

urls_data = {
    "url1" : "https://api.bitkub.com/api/market/ticker",
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

@app.route('/')
def home():
    thb_eth_data = data_dic.get('THB_ETH', {'id': None, 'last': None})
    thb_btc_data = data_dic.get('url1', {}).get('THB_BTC', {'id': None, 'last': None})
    #station_id = data_dic.get[0]["station_id"]
    station_id = data_dic.get('url2', []).get(' ', {'station_id': None, 'last': None})
    return jsonify({
        'id ETH': thb_eth_data.get('id'),
        'last ETH': thb_eth_data.get('last')},
        {
        'id thb_btc' : thb_btc_data.get('id'),
        'last thb_btc' : thb_btc_data.get('last'),
        },
        {
            "station_id":station_id.get('station_id')
        }
        )


if __name__ == "__main__":
    app.run(debug=True)