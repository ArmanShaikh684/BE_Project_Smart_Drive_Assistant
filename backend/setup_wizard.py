import os
import re
import json
from dotenv import load_dotenv

# Load existing env to preserve API keys if they exist
load_dotenv()

ENV_PATH = ".env"
OWNER_CONFIG_PATH = "owner_config.json"

def validate_input(prompt, regex=None, error_msg="Invalid input"):
    while True:
        value = input(prompt).strip()
        if not value:
            print("❌ Input cannot be empty.")
            continue
        if regex and not re.match(regex, value):
            print(f"❌ {error_msg}")
            continue
        return value

def validate_phone(prompt):
    while True:
        raw = input(prompt).strip()
        # Remove spaces, dashes, brackets
        clean = re.sub(r'[\s\-\(\)\+]', '', raw)
        
        # Handle 91 prefix
        if clean.startswith("91") and len(clean) == 12:
            clean = clean[2:]
            
        if len(clean) != 10 or not clean.isdigit():
            print("❌ Invalid Phone Number. Please enter 10 digits.")
            continue
            
        return f"whatsapp:+91{clean}"

def save_owner_config(name, phone, email):
    data = {
        "owner_name": name,
        "owner_phone": phone,
        "owner_email": email,
        "system_configured": True
    }
    
    with open(OWNER_CONFIG_PATH, "w") as f:
        json.dump(data, f, indent=4)
        
    print(f"✅ Owner details saved to {OWNER_CONFIG_PATH}")

def update_env_api_key(key, value):
    if not value: return

    # Read existing lines
    lines = []
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r") as f:
            lines = f.readlines()

    # Create a dict of existing keys
    env_dict = {}
    for line in lines:
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.strip().split("=", 1)
            env_dict[k] = v

    # Update
    env_dict[key] = value

    # Write back to file
    with open(ENV_PATH, "w") as f:
        for k, v in env_dict.items():
            f.write(f"{k}={v}\n")
            
    print(f"✅ API Key saved to {ENV_PATH}")

def run_setup():
    print("=================================================")
    print("   🛠️  SMART DRIVE ASSISTANT - SYSTEM SETUP  🛠️")
    print("=================================================")
    print("Welcome! It looks like this is the first time you are running the system.")
    print("Please configure the CAR OWNER details.\n")
    print("These details will be used for:")
    print("1. Receiving Emergency Alerts from Commercial Drivers.")
    print("2. Default Emergency Contact for Guest Users.")
    print("=================================================\n")

    owner_name = validate_input("Enter Car Owner Name: ")
    owner_phone = validate_phone("Enter Owner Phone Number: ")
    owner_email = validate_input("Enter Owner Email (to receive reports): ", 
                                 r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', 
                                 "Invalid Email Format.")

    save_owner_config(owner_name, owner_phone, owner_email)

    print("\n--- API CONFIGURATION (Press Enter to skip if already set) ---")
    gemini_key = input("Gemini API Key: ").strip()
    update_env_api_key("GEMINI_API_KEY", gemini_key)
    
    print("\n🎉 System Setup Complete!")
    print(f"Owner set to: {owner_name}")
    print("You can now proceed to Driver Registration or Login.")
    print("=================================================")

if __name__ == "__main__":
    run_setup()
