current_driver = {
    "name": "Unknown",
    "trusted_contacts": {}
}

def set_current_driver(profile):
    global current_driver
    current_driver["name"] = profile["name"]
    current_driver["trusted_contacts"] = profile["trusted_contacts"]
    print(f"🔄 Shared State Updated: Driver is now {current_driver['name']}")

def get_trusted_contacts():
    return current_driver["trusted_contacts"]

def get_driver_name():
    return current_driver["name"]