import datetime

def save_data_to_mongo(mongo, all_data):
    for key, documents in all_data.items():
        for station_data in documents:
            # station_data['version'] = datetime.datetime.now()  # เพิ่ม timestamp เป็น version
            mongo.db[key].insert_one(station_data)  # ใช้ insert_one แทน update_one
