import streamlit as st
import os
import subprocess
from git import Repo
from datetime import datetime, timedelta
import requests
import warnings

# Приховуємо технічні попередження macOS/urllib3
warnings.filterwarnings("ignore")

# --- ДАНІ TELEGRAM ---
TELEGRAM_TOKEN = "8289309423:AAFUHf8JZbSsDx-IiMaiS4o-v0UOZ215gEY"
TELEGRAM_CHAT_ID = "310303950"

# --- ІНІЦІАЛІЗАЦІЯ СТАНУ (SESSION STATE) ---
if 'final_report' not in st.session_state:
    st.session_state.final_report = ""
if 'repo_path' not in st.session_state:
    st.session_state.repo_path = os.getcwd()

def select_folder():
    """Відкриває стандартне вікно вибору папки macOS через AppleScript"""
    try:
        script = 'tell application "System Events" to activate\n' \
                 'set theFolder to choose folder with prompt "Виберіть папку з .git:"\n' \
                 'POSIX path of theFolder'
        proc = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
        if proc.returncode == 0:
            path = proc.stdout.strip()
            st.session_state.repo_path = path
            return path
    except Exception:
        pass
    return None

def send_to_telegram(text):
    if not text:
        return False, "Звіт порожній!"
    
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    
    # Telegram limit is 4096 chars.
    def send_chunk(chunk, mode="Markdown"):
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": chunk,
        }
        if mode:
            payload["parse_mode"] = mode
            
        try:
            res = requests.post(url, json=payload, timeout=10)
            if res.status_code == 200:
                return True, None
            return False, res.text
        except Exception as e:
            return False, str(e)

    # Split text if too long
    MAX_LEN = 4000
    chunks = [text[i:i+MAX_LEN] for i in range(0, len(text), MAX_LEN)]
    
    for chunk in chunks:
        # Try Markdown
        success, err = send_chunk(chunk, "Markdown")
        if not success:
            # Try plain text if Markdown failed
            success, err = send_chunk(chunk, None)
            if not success:
                return False, f"Помилка: {err}"
    
    return True, "Надіслано!"
# --- КОНФІГУРАЦІЯ СТОРІНКИ ---
st.set_page_config(page_title="Git AI Reporter", page_icon="🤖", layout="wide")

# Custom CSS for Premium Look
st.markdown("""
    <style>
    /* Main Background */
    .stApp {
        background: radial-gradient(circle at top right, #1a1a2e, #16213e, #0f3460);
        color: #e94560;
    }
    
    /* Center the main container and add glassmorphism */
    .main-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }
    
    /* Headers */
    h1, h2, h3 {
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        background: linear-gradient(90deg, #e94560, #0f3460);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    /* Buttons */
    .stButton>button {
        width: 100%;
        border-radius: 12px;
        background: linear-gradient(135deg, #e94560 0%, #0f3460 100%);
        color: white !important;
        border: none;
        padding: 0.8rem 1.5rem;
        font-weight: 600;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(233, 69, 96, 0.3);
    }
    
    /* Inputs */
    .stTextInput>div>div>input {
        background: rgba(255, 255, 255, 0.05) !important;
        border-radius: 10px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: #fff !important;
    }
    
    /* Expanders (Commit Cards) */
    .stExpander {
        background: rgba(255, 255, 255, 0.02) !important;
        border-radius: 15px !important;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
        margin-bottom: 1rem !important;
        overflow: hidden;
    }
    
    /* Status Messages */
    .stAlert {
        border-radius: 15px;
        border: none;
    }
    
    /* Scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
    }
    ::-webkit-scrollbar-track {
        background: #0f3460;
    }
    ::-webkit-scrollbar-thumb {
        background: #e94560;
        border-radius: 10px;
    }
    </style>
    """, unsafe_allow_html=True)

def analyze_commit(commit_msg, files, duration_mins=None):
    """Запит до локальної нейромережі Ollama"""
    url = "http://localhost:11434/api/generate"
    
    time_info = ""
    if duration_mins:
        hours = duration_mins // 60
        mins = duration_mins % 60
        time_info = f"Реальний витрачений час на цей період: {int(hours)}г {int(mins)}хв."
    
    prompt = f"""
    Ти техлід, що пише звіт про виконану роботу.
    Коміт: "{commit_msg}"
    Змінені файли: {', '.join(files)}
    {time_info}
    
    Напиши:
    1. Що конкретно було зроблено (людською мовою).
    2. Використай наданий час або оціни його, якщо дані неточні.
    Пиши українською.
    """
    try:
        r = requests.post(url, json={
            "model": "llama3", 
            "prompt": prompt, 
            "stream": False
        }, timeout=20)
        return r.json().get('response', "AI не зміг обробити дані.")
    except Exception:
        return "⚠️ Помилка: Переконайтеся, що Ollama запущена."

# --- ІНТЕРФЕЙС ---
with st.container():
    st.title("🤖 Git AI Report Agent")
    st.markdown("___")
    
    # Configuration Section (Card style)
    with st.container():
        cpath, cdate, cbtn = st.columns([3, 1.5, 1])
        
        with cpath:
            # Row 1: Path and Select Folder
            sub_c1, sub_c2 = st.columns([4, 1.2])
            with sub_c1:
                repo_path = st.text_input("📍 Git Repository Path", value=st.session_state.repo_path)
                st.session_state.repo_path = repo_path
            with sub_c2:
                st.write("") # Spacer
                if st.button("📁 Folder"):
                    path = select_folder()
                    if path: st.rerun()
        
        with cdate:
            report_date = st.date_input("📅 Report Date", datetime.now())
            
        with cbtn:
            st.write("") # Spacer
            run_btn = st.button("🚀 Run Agent")

    st.markdown("---")

    if run_btn:
        if not os.path.exists(os.path.join(repo_path, '.git')):
            st.error("Помилка: .git не знайдено.")
        else:
            try:
                repo = Repo(repo_path)
                start = datetime.combine(report_date, datetime.min.time())
                end = start + timedelta(days=1)
                commits = list(repo.iter_commits(since=start, until=end))
            
                if not commits:
                    st.warning(f"За {report_date.strftime('%d.%m.%Y')} комітів не знайдено.")
                    st.session_state.final_report = ""
                else:
                    # Сортуємо від найстарішого до найновішого для розрахунку часу
                    commits.reverse() 
                    st.success(f"Знайдено комітів: {len(commits)}")
                    temp_report = f"📊 *ЗВІТ ЗА {report_date.strftime('%d.%m.%Y')}*\n\n"
                    
                    prev_commit_time = None
                    
                    for commit in commits:
                        commit_time = datetime.fromtimestamp(commit.committed_date)
                        
                        # Розрахунок тривалості
                        duration = 20 # Дефолт для першого коміту або після великої перерви
                        if prev_commit_time:
                            diff = (commit_time - prev_commit_time).total_seconds() / 60
                            if diff < 180: # Якщо менше 3 годин - це одна сесія
                                duration = diff
                            else:
                                duration = 20 # Початок нової сесії
                        
                        with st.expander(f"📌 {commit.summary} ({commit_time.strftime('%H:%M')})"):
                            files = list(commit.stats.files.keys())
                            st.text(f"Hash: {commit.hexsha[:7]} | Час: {int(duration)} хв")
                            with st.spinner("AI аналізує..."):
                                analysis = analyze_commit(commit.summary, files, duration)
                                st.markdown(analysis)
                                temp_report += f"🔹 *{commit.summary}* ({int(duration)} хв)\n{analysis}\n\n"
                        
                        prev_commit_time = commit_time
                    
                    # Зберігаємо результат у стан сесії
                    st.session_state.final_report = temp_report
                    
            except Exception as e:
                st.error(f"Помилка: {e}")

    # Виводимо дії, тільки якщо звіт існує в пам'яті
    if st.session_state.final_report:
        st.divider()
        c1, c2 = st.columns(2)
        with c1:
            st.download_button("📥 Скачати TXT", st.session_state.final_report, f"report.txt")
        with c2:
            if st.button("📲 Надіслати у Telegram"):
                success, message = send_to_telegram(st.session_state.final_report)
                if success:
                    st.success(f"✅ {message}")
                else:
                    st.error(f"❌ {message}")