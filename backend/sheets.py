import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv
import os
import re
import time

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

# Cache
_cache = {"properties": None, "timestamp": 0}
CACHE_TTL = 300  # 5 minutes

def get_sheet_client():
    creds = Credentials.from_service_account_file(
        os.getenv("GOOGLE_CREDENTIALS_PATH", "credentials.json"),
        scopes=SCOPES
    )
    return gspread.authorize(creds)

def clean_price(value) -> int:
    try:
        cleaned = re.sub(r'[^\d]', '', str(value))
        return int(cleaned) if cleaned else 0
    except:
        return 0

def get_all_properties() -> list[dict]:
    global _cache
    now = time.time()

    # Return cached data if still fresh
    if _cache["properties"] is not None and (now - _cache["timestamp"]) < CACHE_TTL:
        print("Using cached properties")
        return _cache["properties"]

    try:
        print("Fetching fresh properties from Google Sheets...")
        client = get_sheet_client()
        sheet = client.open_by_key(os.getenv("SPREADSHEET_ID"))
        ws = sheet.worksheet("Properties")
        records = ws.get_all_records()
        available = [r for r in records if str(r.get("Status", "")).lower() == "available"]

        # Update cache
        _cache["properties"] = available
        _cache["timestamp"] = now
        return available
    except Exception as e:
        print(f"Error fetching properties: {e}")
        return _cache["properties"] or []

def save_lead(name: str, phone: str, interest: str) -> bool:
    try:
        client = get_sheet_client()
        sheet = client.open_by_key(os.getenv("SPREADSHEET_ID"))
        try:
            ws = sheet.worksheet("Leads")
        except gspread.WorksheetNotFound:
            ws = sheet.add_worksheet(title="Leads", rows=1000, cols=10)
            ws.append_row(["Name", "Phone", "Interest", "Date", "Status"])
        from datetime import datetime
        date_str = datetime.now().strftime("%d-%m-%Y %H:%M")
        ws.append_row([name, phone, interest, date_str, "New Lead"])
        return True
    except Exception as e:
        print(f"Error saving lead: {e}")
        return False

def format_properties_for_prompt(properties: list[dict]) -> str:
    if not properties:
        return "No properties currently available."
    lines = []
    for p in properties:
        price = clean_price(p.get('Price (₹)', 0))
        line = (
            f"- [{p.get('Property ID')}] {p.get('Property Type')} | {p.get('Project Name')} | "
            f"{p.get('Location')} | {p.get('BHK')} | {p.get('Area (sqft)')} sqft | "
            f"₹{price:,} | Possession: {p.get('Possession Date')} | "
            f"Amenities: {p.get('Amenities')} | {p.get('Description')}"
        )
        lines.append(line)
    return "\n".join(lines)
