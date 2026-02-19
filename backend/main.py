from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from git import Repo
from datetime import datetime, timedelta
import requests
import os
import json

app = FastAPI(title="Git AI Reporter API")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants from existing app.py
TELEGRAM_TOKEN = "8289309423:AAFUHf8JZbSsDx-IiMaiS4o-v0UOZ215gEY"
TELEGRAM_CHAT_ID = "310303950"
OLLAMA_URL = "http://localhost:11434/api/generate"

class AnalyzeRequest(BaseModel):
    repo_path: str
    date: str  # YYYY-MM-DD

class TelegramRequest(BaseModel):
    text: str

class AIRequest(BaseModel):
    commit_msg: str
    files: list[str]
    duration_mins: int = None

@app.post("/analyze")
async def analyze_repo(req: AnalyzeRequest):
    if not os.path.exists(os.path.join(req.repo_path, '.git')):
        raise HTTPException(status_code=400, detail="Not a git repository")
    
    try:
        repo = Repo(req.repo_path)
        start_date = datetime.strptime(req.date, "%Y-%m-%d")
        end_date = start_date + timedelta(days=1)
        
        commits = list(repo.iter_commits(since=start_date, until=end_date))
        commits.reverse() # Oldest first for time calculation
        
        result_commits = []
        prev_time = None
        
        for commit in commits:
            commit_time = datetime.fromtimestamp(commit.committed_date)
            duration = 20
            if prev_time:
                diff = (commit_time - prev_time).total_seconds() / 60
                duration = diff if diff < 180 else 20
            
            result_commits.append({
                "hash": commit.hexsha[:7],
                "summary": commit.summary,
                "time": commit_time.strftime("%H:%M"),
                "duration": int(duration),
                "files": list(commit.stats.files.keys())
            })
            prev_time = commit_time
            
        return {"commits": result_commits}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-ai")
async def analyze_ai(req: AIRequest):
    time_info = ""
    if req.duration_mins:
        hours = req.duration_mins // 60
        mins = req.duration_mins % 60
        time_info = f"Реальний витрачений час на цей період: {int(hours)}г {int(mins)}хв."
    
    prompt = f"""
    Ти техлід, що пише звіт про виконану роботу.
    Коміт: "{req.commit_msg}"
    Змінені файли: {', '.join(req.files)}
    {time_info}
    
    Напиши:
    1. Що конкретно було зроблено (людською мовою).
    2. Використай наданий час або оціни його, якщо дані неточні.
    Пиши українською.
    """
    
    try:
        r = requests.post(OLLAMA_URL, json={
            "model": "llama3", 
            "prompt": prompt, 
            "stream": False
        }, timeout=30)
        return {"analysis": r.json().get('response', "AI error")}
    except Exception:
        raise HTTPException(status_code=503, detail="Ollama connection failed")

@app.post("/send-telegram")
async def send_telegram(req: TelegramRequest):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    
    def send_chunk(chunk, mode="Markdown"):
        payload = {"chat_id": TELEGRAM_CHAT_ID, "text": chunk}
        if mode: payload["parse_mode"] = mode
        res = requests.post(url, json=payload, timeout=10)
        return res.status_code == 200

    chunks = [req.text[i:i+4000] for i in range(0, len(req.text), 4000)]
    for chunk in chunks:
        if not send_chunk(chunk, "Markdown"):
            if not send_chunk(chunk, None):
                raise HTTPException(status_code=500, detail="Failed to send to Telegram")
    
    return {"status": "success"}

@app.post("/browse")
async def browse_folder():
    import subprocess
    script = 'POSIX path of (choose folder with prompt "Виберіть Git репозиторій:")'
    try:
        proc = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
        if proc.returncode == 0:
            return {"path": proc.stdout.strip()}
        return {"path": ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
