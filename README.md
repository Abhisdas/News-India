# 🇮🇳 Samachar India ⚡
> A premium, glassmorphic client-side news aggregator and AI-powered summarizer for Indian news outlets.

Samachar India parses and aggregates live breaking news from leading Indian news channels—such as **The Hindu**, **Times of India**, **NDTV News**, **Indian Express**, and **Deccan Herald**—fully inside the client browser. It provides instant extractive summaries and key takeaways, with a dual-option system for local offline processing or live cloud-based Google Gemini AI generation.

---

## ✨ Key Features

- **📰 Diverse Indian News Channels:** Syncs feeds across categories: National/General, Business, Tech, Sports, and Entertainment.
- **🛡️ CORS Proxy Fallback Chain:** Implements a multi-layer proxy mechanism to request and parse XML RSS feeds natively in the browser without CORS restrictions.
- **🔮 Dual Summarization Engine:**
  - **Smart Local Summarizer (Default):** Runs an extractive NLP algorithm using sentence-ranking by keyword frequency (removing common stopwords) to generate immediate takeaways locally.
  - **Gemini AI Summarizer (Optional/Pre-configured):** Connects to Google's official Gemini API to construct high-fidelity summaries and key takeaways on demand using the **Gemini 2.5 Flash** model.
- **💾 Browser-Side Bookmarks:** Save important news stories and summaries using local browser storage (`localStorage`), allowing bookmarks to persist across refreshes.
- **🔍 Quick Search & Category Filters:** Instantly filter cards by source, category, or search queries with high performance and fluid animations.
- **🎨 Ultra-Premium UI/UX:**
  - Futuristic dark mode styling with vibrant indigo/violet accents and custom glassmorphism components.
  - Shimmer skeleton screens, micro-interactions, responsive CSS grids, and smooth modal slide overlays.
  - Custom SVG graphics and responsive layouts.

---

## 🛠️ Technology Stack

- **Structure:** Semantic HTML5
- **Styling:** Vanilla CSS3 (Custom properties, Glassmorphism, animations)
- **Logic:** Vanilla ES6+ Javascript (no framework dependencies, fast load speeds)
- **Icons:** Lucide Icons library

---

## 📂 Codebase Structure

```bash
├── index.html   # Main layout structure, search interface, modals, and settings
├── style.css    # Typography, glassmorphic styles, responsive grid, animations
├── app.js       # CORS feed parser, local summarizer, Gemini API client, and state machine
└── README.md    # Product documentation and setup instructions
```

---

## 🚀 Deployment to GitHub Pages

Since Samachar India is a static client-side web application, hosting it on GitHub Pages takes less than a minute with zero build steps required:

1. **Commit and Push:** Push these files (`index.html`, `style.css`, `app.js`, `README.md`) to your GitHub repository:
   ```bash
   git add .
   git commit -m "Initial commit of Samachar India"
   git branch -M main
   git remote add origin https://github.com/Abhisdas/News-India.git
   git push -u origin main
   ```
2. **Enable GitHub Pages:**
   - Go to your repository on GitHub.
   - Click on the **Settings** tab.
   - Under the left sidebar, scroll down to the **Code and automation** section and click **Pages**.
   - Under **Build and deployment**, select **Deploy from a branch** under Source.
   - Select the `main` branch and `/ (root)` folder, then click **Save**.
3. **Launch:**
   - Within 1-2 minutes, GitHub will publish your page. You will see the URL displayed at the top of the Pages settings screen (e.g., `https://abhisdas.github.io/News-India/`).

---

## ⚙️ AI Customization & Gemini Keys

The application is pre-loaded with a Google Gemini API key to enable instant AI summaries out of the box. 

If you or your users wish to use a custom API key:
1. Click the **Gear Icon** in the header navigation.
2. Input the Gemini API key.
3. Click **Save Configuration** (the key is verified and stored securely in the local browser's `localStorage` and never leaves the client device).
