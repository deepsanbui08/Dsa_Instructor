# 🧠 DSA Instructor AI

An AI-powered Data Structures & Algorithms tutor. Ask any DSA question and get clear explanations with code examples. The AI stays focused only on DSA topics and remembers your conversation for follow-up questions.

🔗 **Live Demo:** [https://dsa-instructor-sandy.vercel.app/](https://dsa-instructor-sandy.vercel.app/)  
📦 **Repository:** [https://github.com/deepsanbui08/Dsa_Instructor](https://github.com/deepsanbui08/Dsa_Instructor)

---

## ✨ Features

- 💬 Conversational — supports follow-up questions
- 📚 DSA-only — politely declines non-DSA questions
- 🎨 Dark UI with syntax-highlighted code blocks
- ⚡ Powered by Gemini 2.0 Flash

---

## 🛠️ Tech Stack

- React + Vite
- Tailwind CSS v4
- Google Gemini 2.0 Flash API

---

## 📦 Installation

**1. Clone & install**
```bash
git clone https://github.com/deepsanbui08/Dsa_Instructor.git
cd Dsa_Instructor
npm install
```

**2. Create `.env` file in root**
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
> Get your free API key at [https://aistudio.google.com](https://aistudio.google.com)

**3. Run**
```bash
npm run dev
```

---

## 🌐 Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo → Deploy
3. Add `VITE_GEMINI_API_KEY` in **Settings → Environment Variables**
4. Redeploy

---

## 📁 Project Structure

```
Dsa_Instructor/
├── src/
│   ├── DsaInstructor.jsx   # Main chat component
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── .env                    # API key (never commit!)
├── vite.config.js
└── package.json
```

---

## ⚙️ AI Configuration

Inside `DsaInstructor.jsx`:

```javascript
const GEMINI_MODEL = "gemini-2.0-flash";

generationConfig: {
  temperature: 0.7,       // Response creativity (0 = strict, 1 = creative)
  maxOutputTokens: 8192,  // Max response length
}
```

---

