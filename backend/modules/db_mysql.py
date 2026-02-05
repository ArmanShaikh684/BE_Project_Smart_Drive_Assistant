import mysql.connector
import json
import os
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURATION ---
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME", "smart_drive_db")


def get_connection():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        return conn
    except mysql.connector.Error as err:
        print(f"❌ DB Connection Error: {err}")
        return None


def save_driver_to_db(driver_id, data):
    """Saves driver info to MySQL. Returns True on success, False on failure."""
    conn = get_connection()
    if not conn: return False

    cursor = conn.cursor()

    # Convert dictionary to JSON string for storage
    contacts_json = json.dumps(data['trusted_contacts'])
    
    # Default values if keys are missing (for backward compatibility)
    driver_type = data.get('driver_type', 'Private')
    password = data.get('password', '1234')

    sql = """
    INSERT INTO drivers (driver_ref_id, full_name, emergency_name, emergency_number, email_receiver, trusted_contacts, driver_type, password)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
    full_name=%s, emergency_name=%s, emergency_number=%s, email_receiver=%s, trusted_contacts=%s, driver_type=%s, password=%s
    """

    vals = (
        driver_id, data['name'], data['emergency_contact_name'],
        data['emergency_contact_number'], data['email_receiver'], contacts_json, driver_type, password,
        data['name'], data['emergency_contact_name'],
        data['emergency_contact_number'], data['email_receiver'], contacts_json, driver_type, password
    )

    try:
        cursor.execute(sql, vals)
        conn.commit()
        print(f"✅ Driver '{data['name']}' saved to Database!")
        return True
    except mysql.connector.Error as err:
        print(f"❌ Save Error: {err}")
        return False
    finally:
        cursor.close()
        conn.close()


def get_driver_profile(driver_ref_id):
    """Fetches full profile by ID"""
    conn = get_connection()
    if not conn: return None

    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM drivers WHERE driver_ref_id = %s", (driver_ref_id,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row:
        return {
            "name": row['full_name'],
            "emergency_contact_name": row['emergency_name'],
            "emergency_contact_number": row['emergency_number'],
            "email_receiver": row['email_receiver'],
            "trusted_contacts": json.loads(row['trusted_contacts']),
            "driver_type": row.get('driver_type', 'Private'),
            "password": row.get('password', '1234')
        }
    return None

def validate_login(driver_name, password):
    """Validates password for a given driver name (approximate match)"""
    conn = get_connection()
    if not conn: return None

    cursor = conn.cursor(dictionary=True)
    # Simple search by name
    cursor.execute("SELECT * FROM drivers WHERE full_name LIKE %s", (f"%{driver_name}%",))
    rows = cursor.fetchall()
    
    cursor.close()
    conn.close()

    for row in rows:
        if row['password'] == password:
             return {
                "name": row['full_name'],
                "emergency_contact_name": row['emergency_name'],
                "emergency_contact_number": row['emergency_number'],
                "email_receiver": row['email_receiver'],
                "trusted_contacts": json.loads(row['trusted_contacts']),
                "driver_type": row.get('driver_type', 'Private')
            }

    return None