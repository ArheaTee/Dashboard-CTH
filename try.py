import requests
import json

# Define the API URL
url = "http://172.31.6.60:8090/get_all_process_stations_ui/"

# Send a GET 
response = requests.get(url)

if response.status_code == 200:
    # Parse the JSON response
    data = json.loads(response.text)


    station_id = data[1]

    print(f"First station ID: {station_id}")
else:
    print(f"Error: API request failed with status code {response.status_code}")