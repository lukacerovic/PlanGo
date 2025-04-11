import ollama
import json
import re
from datetime import datetime
from database import SessionLocal 
import models

db = SessionLocal() 

def convert_ordinal_to_number(ordinal: str):
    ordinals = {
        'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5,
        'sixth': 6, 'seventh': 7, 'eighth': 8, 'ninth': 9, 'tenth': 10,
        'eleventh': 11, 'twelfth': 12, 'thirteenth': 13, 'fourteenth': 14,
        'fifteenth': 15, 'sixteenth': 16, 'seventeenth': 17, 'eighteenth': 18,
        'nineteenth': 19, 'twentieth': 20, 'twenty-first': 21, 'twenty-second': 22,
        'twenty-third': 23, 'twenty-fourth': 24, 'twenty-fifth': 25, 'twenty-sixth': 26,
        'twenty-seventh': 27, 'twenty-eighth': 28, 'twenty-ninth': 29, 'thirtieth': 30,
        'thirty-first': 31
    }
    return ordinals.get(ordinal.lower(), None)

def extract_date(command: str):
    date_pattern = r'(\d{1,2}|\w+)(?:st|nd|rd|th)?(?:\s+of\s+)?([A-Za-z]+|\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})'
    match = re.search(date_pattern, command)

    if match:
        day_str = match.group(1)
        month_str = match.group(2)

        if not day_str.isdigit():
            day_str = convert_ordinal_to_number(day_str)

        if isinstance(day_str, int):
            try:
                month_number = datetime.strptime(month_str, "%B").month
                return datetime(2025, month_number, day_str).date()
            except ValueError:
                return None
    return None

def process_voice_command(command: str):
    prompt = f"""
You are an API parser. Your job is to extract a JSON object from a sentence.
The possible actions are: "create trip" or "delete trip".

The JSON format must follow these exact formats:

For creation:
{{
  "create": true,
  "place": "City Name",
  "from": "YYYY-MM-DD",
  "until": "YYYY-MM-DD"
}}

For deletion:
{{
  "delete": true,
  "place": "City Name",
  "from": "YYYY-MM-DD"
}}

If required info is missing, return this format:
{{ "message": "Please repeat your command and make sure to specify: <missing_value>" }}

IMPORTANT: Year for ussage is 2025. Return only valid JSON. Do NOT include code blocks, text, or explanations.

Sentence: '{command}'
"""
    rezultat = []
    try:
        response = ollama.chat(
            model='mistral',
            messages=[{"role": "user", "content": prompt}]
        )

        content = response["message"]["content"]
        print(f"Model response: {content}") 

        try:
            response_json = json.loads(content)
        except json.JSONDecodeError as e:
            return {
                "message": "Model returned invalid JSON.",
                "raw": content
            }

        print("Rezultat: ", rezultat)
        return response_json

    except Exception as e:
        print("🔥 Unexpected error:", e)
        return {"message": "Failed to process the command."}
