import re
import os
from groq import Groq
from dotenv import load_dotenv
from prompts import build_system_prompt
from sheets import get_all_properties, format_properties_for_prompt, save_lead

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_lead(text: str) -> dict | None:
    pattern = r'\[LEAD_CAPTURED:\s*name=(.+?),\s*phone=(.+?),\s*interest=(.+?)\]'
    match = re.search(pattern, text)
    if match:
        return {
            "name": match.group(1).strip(),
            "phone": match.group(2).strip(),
            "interest": match.group(3).strip()
        }
    return None

def clean_response(text: str) -> str:
    return re.sub(r'\[LEAD_CAPTURED:.*?\]', '', text).strip()

def chat(messages: list[dict]) -> dict:
    properties = get_all_properties()
    property_data = format_properties_for_prompt(properties)
    system_prompt = build_system_prompt(property_data)

    groq_messages = [{"role": "system", "content": system_prompt}] + messages

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=groq_messages,
        temperature=0.7,
        max_tokens=500,
    )

    raw_reply = response.choices[0].message.content
    lead = extract_lead(raw_reply)
    lead_saved = False

    if lead:
        lead_saved = save_lead(lead["name"], lead["phone"], lead["interest"])

    clean_reply = clean_response(raw_reply)

    return {
        "reply": clean_reply,
        "lead_captured": lead is not None,
        "lead_saved": lead_saved,
        "lead": lead
    }
