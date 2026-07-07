import sys
import os
import time
import json
import subprocess
from dotenv import load_dotenv

# Load env to check configuration
load_dotenv()

from modules.face_login import recognize_driver
from modules.db_mysql import validate_login
from main import start_monitoring

OWNER_CONFIG_PATH = "owner_config.json"

def get_owner_config():
    if os.path.exists(OWNER_CONFIG_PATH):
        with open(OWNER_CONFIG_PATH, "r") as f:
            return json.load(f)
    return None

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def check_system_config():
    """Checks if the system has an Owner configured."""
    if not os.path.exists(OWNER_CONFIG_PATH):
        print("⚠️ System not configured. Launching Setup Wizard...")
        try:
            subprocess.run([sys.executable, "setup_wizard.py"], check=True)
        except Exception as e:
            print(f"❌ Setup Failed: {e}")
            sys.exit(1)

def show_fallback_menu():
    while True:
        clear_screen()
        print("=========================================")
        print("   ⛔ FACE NOT RECOGNIZED")
        print("=========================================")
        print("1. 🔄 Try Face Scan Again")
        print("2. 🔑 Login with Password")
        print("3. 📝 Register New Driver")
        print("4. 👤 Guest Mode (One-Time Access)")
        print("5. ❌ Exit")
        print("=========================================")
        
        choice = input("Select Option (1-5): ").strip()
        
        if choice == '1':
            return "retry"
        elif choice == '2':
            return "password"
        elif choice == '3':
            return "register"
        elif choice == '4':
            return "guest"
        elif choice == '5':
            sys.exit()
        else:
            print("Invalid choice.")
            time.sleep(1)

def password_login():
    print("\n--- PASSWORD LOGIN ---")
    name = input("Enter Driver Name: ").strip()
    password = input("Enter Password: ").strip()
    
    profile = validate_login(name, password)
    if profile:
        print(f"✅ Login Successful! Welcome {profile['name']}")
        time.sleep(1)
        return profile
    else:
        print("❌ Invalid Name or Password.")
        time.sleep(2)
        return None

def register_new_driver():
    print("\n🚀 Launching Registration Wizard...")
    # Run the register_driver.py script as a subprocess
    try:
        subprocess.run([sys.executable, "register_driver.py"], check=True)
        print("✅ Registration Finished. Please try logging in now.")
        time.sleep(2)
        return "retry" # Go back to face scan
    except Exception as e:
        print(f"❌ Error launching registration: {e}")
        time.sleep(2)
        return None

def main():
    # 0. Check Configuration First
    check_system_config()

    print("=========================================")
    print("   🚗 SMART DRIVE ASSISTANT - STARTUP")
    print("=========================================")
    
    # 1. Attempt Auto-Login (Face)
    print("👀 Scanning Face...")
    profile = recognize_driver()
    
    if profile:
        # Success! Start System
        start_monitoring(profile)
        return

    # 2. Fallback Loop
    while True:
        action = show_fallback_menu()
        
        if action == "retry":
            profile = recognize_driver()
            if profile:
                start_monitoring(profile)
                return
                
        elif action == "password":
            profile = password_login()
            if profile:
                start_monitoring(profile)
                return
                
        elif action == "register":
            result = register_new_driver()
            # Loop back to menu/retry
            
        elif action == "guest":
            print("\n⚠️ WARNING: Guest Mode Active.")
            print("   Alerts will be sent to the Car Owner.")
            time.sleep(2)
            
            # Load Owner Config for Guest
            owner_data = get_owner_config()
            if owner_data:
                guest_profile = {
                    "name": "Guest Driver",
                    "emergency_contact_name": owner_data.get("owner_name", "Car Owner"),
                    "emergency_contact_number": owner_data.get("owner_phone", ""),
                    "email_receiver": owner_data.get("owner_email", ""),
                    "trusted_contacts": {},
                    "driver_type": "Guest"
                }
                start_monitoring(guest_profile)
            else:
                print("❌ Error: Could not load Owner Config.")
                time.sleep(2)
            return

if __name__ == "__main__":
    main()
