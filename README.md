# AI Dermatologist Assistant

Local Flask app with real upload handling, admin-approved brand management, and OpenAI image analysis when an API key is configured.

## Run on Windows PowerShell

```powershell
cd "C:\Users\Chameleon\Documents\Codex\2026-05-25\prior-conversation-with-codex-conversation-role"
.\.venv\Scripts\python.exe app.py --port 8081
```

Open:

```text
http://localhost:8081
```

Port `8080` already had an old broken server in this environment, so use `8081` unless you stop the old process.

## Configure AI

Create a `.env` file in this folder:

```text
AI_PROVIDER=ollama
OLLAMA_API_KEY=your_ollama_key_here
OLLAMA_BASE_URL=https://ollama.com/api
OLLAMA_MODEL=gemma3:12b
OLLAMA_CHAT_MODEL=gemma3:12b
ADMIN_PASSWORD=admin123
```

For local Ollama instead of Ollama cloud, use:

```text
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/api
OLLAMA_MODEL=gemma3
OLLAMA_CHAT_MODEL=gemma3
ADMIN_PASSWORD=admin123
```

The scan result includes skincare observations, a subjective PSL-style visual harmony score, a facial rating, and a visible facial proportion/photo ratio score. The chat assistant uses `/chat` and the `OLLAMA_CHAT_MODEL` value.

## Notes

- Admin password defaults to `admin123`.
- If `OPENAI_API_KEY` is not set, the site still opens, but analysis will say AI is not configured.
- This is educational only and is not a medical diagnosis.
