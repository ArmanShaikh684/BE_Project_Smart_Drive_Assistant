import cv2
import os
import re
import time
import json
from dotenv import load_dotenv
from modules.db_mysql import save_driver_to_db

load_dotenv()

OWNER_CONFIG_PATH = "owner_config.json"

def get_owner_config():
    if os.path.exists(OWNER_CONFIG_PATH):
        with open(OWNER_CONFIG_PATH, "r") as f:
            return json.load(f)
    return None

# --- VALIDATION FUNCTIONS ---

def validate_name(prompt):
    while True:
        name = input(prompt).strip()
        
        if not name:
            print("❌ Name cannot be empty. Please try again.")
            continue
            
        # Check for digits (Did you enter a phone number?)
        if any(char.isdigit() for char in name):
            print("❌ Name cannot contain numbers. Did you enter a phone number?")
            continue
            
        # Check for at least one letter
        if not any(char.isalpha() for char in name):
            print("❌ Name must contain letters.")
            continue
            
        return name.title()

def validate_phone(prompt):
    while True:
        raw_input = input(prompt).strip()
        
        if not raw_input:
            print("❌ Phone number cannot be empty.")
            continue
            
        # Check for letters (Did you enter a name?)
        if any(char.isalpha() for char in raw_input):
            print("❌ Phone number cannot contain letters. Did you enter a name?")
            continue
            
        # Sanitize: Remove spaces, dashes, brackets, plus signs
        clean_number = re.sub(r'[\s\-\(\)\+]', '', raw_input)
        
        # Handle +91 or 91 prefix removal for length check
        if clean_number.startswith("91") and len(clean_number) == 12:
            clean_number = clean_number[2:]
            
        # Exact Length Check
        if len(clean_number) != 10:
            print(f"❌ Invalid Length. Expected 10 digits, got {len(clean_number)}.")
            continue
            
        # Auto-Format for Twilio
        formatted_number = f"whatsapp:+91{clean_number}"
        return formatted_number

def validate_email(prompt):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    while True:
        email = input(prompt).strip()
        
        if not email:
            print("❌ Email cannot be empty.")
            continue
            
        if not re.match(email_regex, email):
            print("❌ Invalid Email Format. (Example: user@gmail.com)")
            continue
            
        return email

def validate_password(prompt):
    while True:
        pwd = input(prompt).strip()
        if len(pwd) < 4:
            print("❌ Password must be at least 4 characters.")
            continue
        return pwd

# --- FACE CAPTURE ---

def capture_face(driver_name):
    print("\n📸 STARTING FACE CAPTURE...")
    print("1. Look at the camera.")
    print("2. Align your face in the GREEN BOX.")
    print("3. Press 's' to SAVE and finish.")
    print("4. Press 'q' to CANCEL.")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Could not open camera.")
        return None

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    save_path = "known_faces"
    if not os.path.exists(save_path):
        os.makedirs(save_path)
        
    filename = f"{driver_name.lower().replace(' ', '_')}.jpg"
    full_path = os.path.join(save_path, filename)
    
    while True:
        ret, frame = cap.read()
        if not ret: continue
        
        # Flip for mirror effect
        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Draw Guide Box (Center of screen)
        h, w, _ = frame.shape
        center_x, center_y = w // 2, h // 2
        box_size = 200
        cv2.rectangle(frame, (center_x - 100, center_y - 100), (center_x + 100, center_y + 100), (0, 255, 0), 2)
        
        # Draw detected faces
        face_detected = False
        for (x, y, w_f, h_f) in faces:
            cv2.rectangle(frame, (x, y), (x+w_f, y+h_f), (255, 0, 0), 2)
            
            # Check if face is roughly inside the guide box
            if x > center_x - 120 and x < center_x + 20 and y > center_y - 120 and y < center_y + 20:
                face_detected = True
                cv2.putText(frame, "PERFECT! Press 's'", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow("Face Registration", frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('s'):
            if face_detected:
                cv2.imwrite(full_path, frame)
                print(f"✅ Face saved to {full_path}")
                cap.release()
                cv2.destroyAllWindows()
                return filename
            else:
                print("⚠️ Face not aligned or not detected. Please position inside the box.")
        elif key == ord('q'):
            print("❌ Face capture cancelled.")
            cap.release()
            cv2.destroyAllWindows()
            return None

# --- MAIN REGISTRATION FLOW ---

def main():
    print("=================================================")
    print("   🚗 NEW DRIVER REGISTRATION 🚗   ")
    print("=================================================")
    
    # 1. Driver Type Selection
    print("\n--- 1. DRIVER TYPE ---")
    print("A: Private Driver (Family/Friends) - Choose your own contacts.")
    print("B: Commercial Driver (Employee) - Safety alerts go to Car Owner.")
    
    driver_type = "Private"
    while True:
        choice = input("Select Type (A/B): ").strip().upper()
        if choice == 'A':
            driver_type = "Private"
            break
        elif choice == 'B':
            driver_type = "Commercial"
            break
        else:
            print("❌ Invalid choice. Please enter A or B.")

    # 2. Personal Info
    print("\n--- 2. DRIVER DETAILS ---")
    name = validate_name("Enter Driver Name: ")
    password = validate_password("Set a Login Password/PIN: ")
    
    # 3. Emergency Info Logic
    ec_name = ""
    ec_number = ""
    email_receiver = ""
    
    if driver_type == "Commercial":
        print("\n🔒 COMMERCIAL MODE ACTIVE: Emergency contacts locked to Car Owner.")
        
        # Fetch Owner details from JSON
        owner_data = get_owner_config()
        
        if owner_data:
            ec_name = owner_data.get("owner_name", "Car Owner")
            ec_number = owner_data.get("owner_phone", "")
            email_receiver = owner_data.get("owner_email", "")
            print(f"✅ Alerts will be sent to: {ec_name} ({ec_number})")
        else:
            print("⚠️ Owner Config Missing! Asking manually...")
            ec_name = validate_name("Owner Name: ")
            ec_number = validate_phone("Owner Number: ")
            email_receiver = validate_email("Owner Email: ")
            
    else:
        # Private Mode: Ask user
        print("\n--- 3. EMERGENCY CONTACT ---")
        ec_name = validate_name("Emergency Contact Name: ")
        ec_number = validate_phone("Emergency Contact Number: ")
        print("\n--- 4. EMAIL ALERTS ---")
        email_receiver = validate_email("Receiver Email (for reports): ")
    
    # 4. Trusted Contacts
    trusted_contacts = {}
    
    # Auto-add Emergency Contact
    trusted_contacts[ec_number] = ec_name
    
    if driver_type == "Private":
        print("\n--- 5. TRUSTED CONTACTS (WhatsApp) ---")
        print("Enter names and numbers of people allowed to message you.")
        print("Type 'done' when finished.")
        
        while True:
            c_name = input("\nContact Name (or 'done'): ").strip()
            if c_name.lower() == 'done':
                break
            
            if any(char.isdigit() for char in c_name):
                print("❌ Name cannot contain numbers.")
                continue
                
            c_number = validate_phone(f"Number for {c_name}: ")
            trusted_contacts[c_number] = c_name
    else:
        print("\n🔒 COMMERCIAL MODE: Only Owner is added to trusted contacts.")

    # 5. Face Capture
    print("\n--- 6. FACE REGISTRATION ---")
    face_filename = capture_face(name)
    
    if not face_filename:
        print("❌ Registration Aborted (No Face Captured).")
        return

    # --- FINAL CONFIRMATION ---
    print("\n=================================================")
    print("   📝 REVIEW YOUR INFORMATION   ")
    print("=================================================")
    print(f"Type: {driver_type}")
    print(f"Name: {name}")
    print(f"Password: {'*' * len(password)}")
    print(f"Emergency Contact: {ec_name} ({ec_number})")
    print(f"Email Receiver: {email_receiver}")
    print(f"Trusted Contacts: {len(trusted_contacts)} added")
    for k, v in trusted_contacts.items():
        print(f"  - {v}: {k}")
    print("=================================================")
    
    confirm = input("\nIs this information correct? (y/n): ").strip().lower()
    
    if confirm != 'y':
        print("\n❌ Registration Cancelled. Please restart to correct errors.")
        full_path = os.path.join("known_faces", face_filename)
        if os.path.exists(full_path):
            os.remove(full_path)
        return

    # 6. Save to Database
    driver_id = face_filename.replace(".jpg", "") 
    
    driver_data = {
        "name": name,
        "emergency_contact_name": ec_name,
        "emergency_contact_number": ec_number,
        "email_receiver": email_receiver,
        "trusted_contacts": trusted_contacts,
        "driver_type": driver_type,
        "password": password
    }
    
    print("\n⏳ Saving to Database...")
    success = save_driver_to_db(driver_id, driver_data)
    
    if success:
        print("\n=================================================")
        print(f"🎉 REGISTRATION COMPLETE for {name}!")
        print("You can now log in using Face Recognition.")
        print("=================================================")
    else:
        print("\n❌ REGISTRATION FAILED due to Database Error.")

if __name__ == "__main__":
    main()
