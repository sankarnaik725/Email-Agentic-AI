"""Voice-to-Email Ghostwriter Engine.
Transforms informal dictated voice notes into polished executive emails
written in Santhosh's authentic cloned style.
"""

from typing import Dict, Any, Optional
from style_cloner import load_style_profile
from config import load_config


def polish_dictated_voice_note(raw_transcript: str, tone: str = "Executive Professional", recipient_hint: str = "") -> Dict[str, Any]:
    """Convert raw voice note transcription into a structured, style-cloned email draft."""
    raw = raw_transcript.strip()
    if not raw:
        return {"error": "Voice note transcript is empty"}

    profile = load_style_profile()
    user_name = profile.get("user_name", "Santhosh Dhanavath")
    first_name = user_name.split()[0]
    signoff = profile.get("preferred_signoffs", ["Best regards,\n" + user_name])[0]

    cfg = load_config()
    api_key = cfg.get("gemini_api_key")

    # If Gemini is configured, use it for deep stylistic transformation
    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            prompt = f"""You are an elite Executive Ghostwriter for {user_name}.
Convert this informal spoken voice note into a crisp, perfectly structured email.
Tone: {tone}
Recipient context: {recipient_hint or 'Colleague/Team'}
Signoff: {signoff}

Informal Voice Note:
"{raw}"

Return a JSON object with:
{{
  "suggested_subject": "Crisp 4-7 word professional subject",
  "polished_body": "Formatted email text including greeting, well-structured paragraphs/bullets, and signoff",
  "key_points": ["bullet 1", "bullet 2"]
}}
"""
            resp = client.models.generate_content(
                model=cfg.get("gemini_model", "gemini-2.5-flash"),
                contents=prompt
            )
            import json
            clean_text = resp.text.strip()
            if "{" in clean_text and "}" in clean_text:
                json_str = clean_text[clean_text.find("{"):clean_text.rfind("}")+1]
                data = json.loads(json_str)
                data["raw_transcript"] = raw
                data["engine"] = "gemini-ghostwriter"
                return data
        except Exception as e:
            print(f"Ghostwriter GenAI failed: {e}")

    # High quality rule-based heuristic formatting fallback
    greeting = f"Hi {recipient_hint.split()[0] if recipient_hint else 'there'},"
    
    # Capitalize first letter
    body_core = raw[0].upper() + raw[1:] if len(raw) > 1 else raw
    if not body_core.endswith("."):
        body_core += "."

    subject = "Follow-up: " + " ".join(raw.split()[:5]).title()

    formatted_email = f"""{greeting}

I hope you're having a productive week.

{body_core}

Please let me know if you need any additional clarification or if you'd like to sync further.

{signoff}"""

    return {
        "suggested_subject": subject,
        "polished_body": formatted_email,
        "key_points": [raw],
        "raw_transcript": raw,
        "engine": "style-cloned-heuristics"
    }
