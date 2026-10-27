import urllib.request
import urllib.error
import json

data = {
    "entry_date": "2026-05-25",
    "source": 1,
    "loading_location": "",
    "unloading_location": "",
    "shift": "Morning",
    "water_type": "Drinking Water",
    "vehicle": "",
    "load_count": 1,
    "meter_reading_current": "100",
    "meter_reading_previous": "90",
    "manual_capacity_liters": "",
    "total_quantity_liters": "10",
    "total_cost": 50,
    "comments": ""
}

req = urllib.request.Request(
    'http://localhost:8080/api/entries/', 
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    response = urllib.request.urlopen(req)
    print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code)
    print("Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", str(e))
