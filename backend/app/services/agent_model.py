"""Optional model tool selection for messages the deterministic parser cannot classify."""
import json
import os

import httpx

TOOLS = ("status", "docker", "handoff", "explain")
DESCRIPTION = "Select one read-only DevPulse tool if the user asks about Git changes, containers, handoffs, or CI failures."
SCHEMA = {"type": "object", "properties": {"action": {"type": "string", "enum": list(TOOLS)}},
          "required": ["action"], "additionalProperties": False}


def select_tool(message, history):
    openai = os.getenv("OPENAI_API_KEY")
    gemini = os.getenv("GEMINI_API_KEY")
    if not (openai or gemini):
        return None, "deterministic"
    prompt = json.dumps({"history": [turn.model_dump() for turn in history[-6:]], "message": message})
    try:
        if openai:
            response = httpx.post("https://api.openai.com/v1/responses",
                                  headers={"Authorization": f"Bearer {openai}"}, timeout=5, json={
                "model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"), "store": False,
                "instructions": DESCRIPTION, "input": prompt, "parallel_tool_calls": False,
                "tools": [{"type": "function", "name": "inspect_devpulse", "description": DESCRIPTION,
                           "parameters": SCHEMA, "strict": True}],
            })
            response.raise_for_status()
            for item in response.json().get("output", []):
                if item.get("type") == "function_call" and item.get("name") == "inspect_devpulse":
                    action = json.loads(item["arguments"]).get("action")
                    if action in TOOLS:
                        return action, "openai"
        else:
            model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
            response = httpx.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                headers={"x-goog-api-key": gemini}, timeout=5, json={
                    "contents": [{"parts": [{"text": DESCRIPTION + "\n" + prompt}]}],
                    "tools": [{"functionDeclarations": [{"name": "inspect_devpulse",
                               "description": DESCRIPTION, "parametersJsonSchema": SCHEMA}]}],
                },
            )
            response.raise_for_status()
            for candidate in response.json().get("candidates", []):
                for part in candidate.get("content", {}).get("parts", []):
                    call = part.get("functionCall", {})
                    action = call.get("args", {}).get("action")
                    if call.get("name") == "inspect_devpulse" and action in TOOLS:
                        return action, "gemini"
    except (httpx.HTTPError, ValueError, TypeError, KeyError):
        pass
    return None, "deterministic"
