/**
 * Samachar India - Core Application Logic
 * Implements client-side RSS fetching, local summarization, Optional Gemini AI integration,
 * searching, filtering, and bookmarking.
 */

// ==========================================================================
// 1. Configuration & Constants
// ==========================================================================

// Indian News RSS Feeds mapped to categories
const NEWS_FEEDS = [
  // The Hindu
  {
    name: "The Hindu",
    key: "the-hindu",
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
    category: "national"
  },
  {
    name: "The Hindu",
    key: "the-hindu",
    url: "https://www.thehindu.com/business/feeder/default.rss",
    category: "business"
  },
  {
    name: "The Hindu",
    key: "the-hindu",
    url: "https://www.thehindu.com/sci-tech/technology/feeder/default.rss",
    category: "technology"
  },
  // NDTV
  {
    name: "NDTV News",
    key: "ndtv",
    url: "https://feeds.feedburner.com/ndtvnews-top-stories",
    category: "national"
  },
  {
    name: "NDTV News",
    key: "ndtv",
    url: "https://feeds.feedburner.com/ndtvnews-profit-to-business",
    category: "business"
  },
  {
    name: "NDTV News",
    key: "ndtv",
    url: "https://feeds.feedburner.com/ndtvnews-latest-sports",
    category: "sports"
  },
  // Times of India
  {
    name: "Times of India",
    key: "toi",
    url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    category: "national"
  },
  {
    name: "Times of India",
    key: "toi",
    url: "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",
    category: "business"
  },
  {
    name: "Times of India",
    key: "toi",
    url: "https://timesofindia.indiatimes.com/rssfeeds/66949542.cms",
    category: "technology"
  },
  // Indian Express
  {
    name: "Indian Express",
    key: "indian-express",
    url: "https://indianexpress.com/section/india/feed/",
    category: "national"
  },
  {
    name: "Indian Express",
    key: "indian-express",
    url: "https://indianexpress.com/section/technology/feed/",
    category: "technology"
  },
  // Deccan Herald
  {
    name: "Deccan Herald",
    key: "deccan-herald",
    url: "https://www.deccanherald.com/national/index.rss",
    category: "national"
  },
  {
    name: "Deccan Herald",
    key: "deccan-herald",
    url: "https://www.deccanherald.com/sports/index.rss",
    category: "sports"
  },
  {
    name: "Deccan Herald",
    key: "deccan-herald",
    url: "https://www.deccanherald.com/entertainment/index.rss",
    category: "entertainment"
  }
];

// Reliable CORS proxies list (attempted in order)
const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

// Stopwords for the local summarization NLP script
const STOPWORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'adds',
  'says', 'said', 'also', 'would', 'could', 'new', 'first', 'two', 'last', 'one', 'reported'
]);

// Fallback Mock News Data (for initial load speed / offline / CORS failures)
const FALLBACK_NEWS = [
  {
    id: "mock-1",
    title: "ISRO Successfully Launches New Weather Monitoring Satellite INSAT-3DS",
    link: "https://www.isro.gov.in",
    pubDate: new Date(Date.now() - 3600000 * 2).toUTCString(), // 2 hours ago
    description: "The Indian Space Research Organisation (ISRO) successfully deployed the INSAT-3DS meteorological satellite aboard the GSLV-F14 rocket. The satellite will provide highly detailed data on atmospheric profiles, sea-surface temperature, and cloud dynamics, assisting India's weather services in making highly precise forecasts for monsoons and severe cyclones.",
    source: "ISRO News",
    sourceKey: "indian-express",
    category: "technology",
    content: "ISRO's workhorse GSLV-F14 successfully launched INSAT-3DS from the Satish Dhawan Space Centre in Sriharikota. This weather monitoring satellite is designed to enhance meteorological services and monitor sea surfaces. It features advanced sounders and imagers to record precise atmospheric variations and ocean temperature columns."
  },
  {
    id: "mock-2",
    title: "India's UPI Expands to Mauritius and Sri Lanka, Boosting Digital Payments Link",
    link: "https://www.rbi.org.in",
    pubDate: new Date(Date.now() - 3600000 * 4).toUTCString(), // 4 hours ago
    description: "In a major boost to cross-border financial connectivity, India's Unified Payments Interface (UPI) services have been launched in Sri Lanka and Mauritius. Users from both countries and Indian tourists traveling abroad can now make instant mobile transactions using UPI apps, reducing transaction costs and simplifying tourism payments.",
    source: "Deccan Herald",
    sourceKey: "deccan-herald",
    category: "business",
    content: "The virtual launch event was attended by Indian Prime Minister Narendra Modi, Sri Lankan President Ranil Wickremesinghe, and Mauritian Prime Minister Pravind Jugnauth. PM Modi remarked that digital public infrastructure (DPI) has transformed financial inclusion in India, and sharing this technology with friendly neighbors will strengthen bilateral economic ties and tourist flows."
  },
  {
    id: "mock-3",
    title: "IPL 2026 Season Kickoff: Key Venues and Matches Announced",
    link: "https://www.bcci.tv",
    pubDate: new Date(Date.now() - 3600000 * 6).toUTCString(), // 6 hours ago
    description: "The Board of Control for Cricket in India (BCCI) has officially announced the schedule for the opening phase of the Indian Premier League (IPL) 2026. The season opener is slated to take place at the iconic Wankhede Stadium in Mumbai, featuring a high-octane clash between the defending champions and runners-up.",
    source: "NDTV News",
    sourceKey: "ndtv",
    category: "sports",
    content: "Cricket enthusiasts across India are gearing up as the IPL 2026 gets underway. With teams incorporating new international talent and young local prodigies after the recent mini-auction, analysts expect one of the most competitive seasons in IPL history. Safety measures, transit logistics, and ticketing portals have been updated to support massive stadium turnouts."
  },
  {
    id: "mock-4",
    title: "Indian Startup Ecosystem Secures Over $3B Funding in Q1, Driven by DeepTech and AI",
    link: "https://timesofindia.indiatimes.com",
    pubDate: new Date(Date.now() - 3600000 * 10).toUTCString(), // 10 hours ago
    description: "Indian technology startups experienced a strong resurgence in venture capital funding in the first quarter of the year, raising a combined $3.2 billion. The growth was primarily driven by massive investments in Artificial Intelligence integrations, green energy transition, and deeptech infrastructure, signaling an end to the funding winter.",
    source: "Times of India",
    sourceKey: "toi",
    category: "business",
    content: "According to reports by leading financial intelligence agencies, early-stage and series A rounds in sustainable energy and edge AI applications showed maximum growth. Bangalore and Mumbai continue to capture the lion's share of funding, while cities like Hyderabad and Pune are emerging as robust innovation hubs."
  },
  {
    id: "mock-5",
    title: "Indian National Award-Winning Film Wins Big at International Film Festival",
    link: "https://www.thehindu.com",
    pubDate: new Date(Date.now() - 3600000 * 18).toUTCString(), // 18 hours ago
    description: "An independent Indian drama film focused on climate resilience in coastal villages has bagged the prestigious Jury Grand Prize at the International Film Festival. The director dedicated the award to the coastal communities of Odisha and Kerala, whose lives and struggles inspired the cinematic narrative.",
    source: "The Hindu",
    sourceKey: "the-hindu",
    category: "entertainment",
    content: "The movie, praised by global film critics for its raw visual storytelling, captures the changes in coastal ecosystems and human relationships. It marks the first time in five years that an Indian regional language film has competed and won a major category at this level of international festivals, boosting distribution prospects in Europe and North America."
  },
  {
    id: "mock-6",
    title: "India Sets Ambitious Goal to Install 500GW Clean Energy Infrastructure by 2030",
    link: "https://www.thehindu.com",
    pubDate: new Date(Date.now() - 3600000 * 24).toUTCString(), // 1 day ago
    description: "India is accelerating its renewable energy goals, aiming to have 500 gigawatts of non-fossil fuel electricity capacity by 2030. High-level solar parks in Rajasthan and wind farms in Gujarat are receiving massive public-private investments, paving the way for a substantial drop in grid emissions.",
    source: "The Hindu",
    sourceKey: "the-hindu",
    category: "national",
    content: "The Ministry of New and Renewable Energy has announced new transmission lines dedicated exclusively to green power distribution. This policy update is expected to draw interest from global environmental funds, enabling India to transition key manufacturing sectors to carbon-neutral grids ahead of original targets."
  }
];

// ==========================================================================
// 2. Application State
// ==========================================================================
const state = {
  articles: [],          // Parsed live & fallback articles
  bookmarks: [],         // Array of article IDs saved by user
  activeCategory: 'all', // 'all', 'national', 'business', 'technology', 'sports', 'entertainment'
  activeSource: 'all',   // 'all', 'the-hindu', 'ndtv', 'toi', 'indian-express', 'deccan-herald'
  searchQuery: '',       // Search string
  showSavedOnly: false,  // Toggle to show only saved items
  selectedArticle: null, // Currently active article in details modal
  geminiKey: localStorage.getItem('gemini_api_key') || '',
  isFetching: false
};

// Load saved bookmarks from localStorage
const storedBookmarks = localStorage.getItem('saved_news_bookmarks');
if (storedBookmarks) {
  try {
    state.bookmarks = JSON.parse(storedBookmarks);
  } catch (e) {
    state.bookmarks = [];
  }
}

// ==========================================================================
// 3. Helper Functions
// ==========================================================================

// Create a unique hash for articles based on Title/Link
function generateUniqueId(text) {
  if (!text) return Math.random().toString(36).substring(2, 9);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return 'art-' + Math.abs(hash).toString(36);
}

// Convert absolute publication dates into readable relative time
function getRelativeTime(dateString) {
  try {
    const pubDate = new Date(dateString);
    if (isNaN(pubDate.getTime())) return dateString;
    
    const diffMs = Date.now() - pubDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (e) {
    return dateString;
  }
}

// Strip HTML tags and clean up double spaces/newlines
function cleanHtmlText(html) {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Extract text and clean spacing
  let text = tempDiv.textContent || tempDiv.innerText || '';
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/\s+/g, ' ')
             .replace(/Click here to read more.*/gi, '')
             .trim();
  return text;
}

// Make a robust fetch call trying different proxies
async function fetchWithProxy(targetUrl) {
  for (const proxyBuilder of CORS_PROXIES) {
    const proxyUrl = proxyBuilder(targetUrl);
    try {
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
      if (response.ok) {
        // Allorigins returns JSON enclosing the raw content, let's parse accordingly
        if (proxyUrl.includes('allorigins.win/raw')) {
          const rawText = await response.text();
          if (rawText && rawText.includes('<rss')) {
            return rawText;
          }
        } else if (proxyUrl.includes('allorigins.win')) {
          const json = await response.json();
          return json.contents;
        } else {
          return await response.text();
        }
      }
    } catch (e) {
      console.warn(`Proxy fetch failed for URL: ${proxyUrl}. Retrying next proxy.`, e);
    }
  }
  throw new Error("All CORS proxies exhausted.");
}

// ==========================================================================
// 4. RSS Parser Logic
// ==========================================================================
function parseRssFeed(xmlText, feedConfig) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const items = xmlDoc.querySelectorAll("item");
  const parsedArticles = [];

  items.forEach(item => {
    const title = cleanHtmlText(item.querySelector("title")?.textContent || "");
    const link = item.querySelector("link")?.textContent || "";
    const pubDate = item.querySelector("pubDate")?.textContent || "";
    
    // Description parsing can be complex as it might embed photos/HTML
    let rawDescription = item.querySelector("description")?.textContent || "";
    let cleanSnippet = cleanHtmlText(rawDescription);
    
    // Sometimes TOI or NDTV put full content inside content:encoded
    let contentEncoded = item.querySelector("encoded")?.textContent || "";
    let cleanFullContent = cleanHtmlText(contentEncoded) || cleanSnippet;

    if (!title || !link) return;

    // Build normalised article item
    parsedArticles.push({
      id: generateUniqueId(title + link),
      title: title,
      link: link,
      pubDate: pubDate,
      description: cleanSnippet.slice(0, 250) + (cleanSnippet.length > 250 ? '...' : ''),
      content: cleanFullContent,
      source: feedConfig.name,
      sourceKey: feedConfig.key,
      category: feedConfig.category
    });
  });

  return parsedArticles;
}

// Fetch all feeds concurrently and aggregate them
async function fetchNews() {
  state.isFetching = true;
  updateStatusUI("Connecting to Indian news sources...", true);
  
  const promises = NEWS_FEEDS.map(async (feed) => {
    try {
      const xmlText = await fetchWithProxy(feed.url);
      if (!xmlText) return [];
      return parseRssFeed(xmlText, feed);
    } catch (err) {
      console.error(`Failed to fetch RSS for ${feed.name} (${feed.category}):`, err);
      return [];
    }
  });

  try {
    const results = await Promise.all(promises);
    let allArticles = results.flat();

    // Sort by publication date (descending)
    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    
    // Filter duplicates
    const seenTitles = new Set();
    state.articles = allArticles.filter(article => {
      const normalizedTitle = article.title.toLowerCase().trim();
      if (seenTitles.has(normalizedTitle)) return false;
      seenTitles.add(normalizedTitle);
      return true;
    });

    // If no articles fetched successfully (all proxies failed/offline), load fallback mock news
    if (state.articles.length === 0) {
      console.warn("Could not fetch live news feeds. Loading offline fallback news.");
      state.articles = [...FALLBACK_NEWS];
      updateStatusUI("Offline. Showing recent curated news from India.", false);
    } else {
      updateStatusUI(`Successfully synced ${state.articles.length} news stories!`, false);
    }
  } catch (error) {
    console.error("General news fetch error: ", error);
    state.articles = [...FALLBACK_NEWS];
    updateStatusUI("Using recent cached news (Network Offline).", false);
  } finally {
    state.isFetching = false;
    renderArticles();
  }
}

// ==========================================================================
// 5. Local Summarization NLP Engine (Extractive Summary)
// ==========================================================================
function generateLocalSummary(article) {
  const text = article.content || article.description || "";
  
  // Clean description and break into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const cleanSentences = sentences
    .map(s => s.trim())
    .filter(s => s.length > 15 && s.split(/\s+/).length > 4); // Avoid tiny titles or artifacts
  
  if (cleanSentences.length <= 2) {
    // If text is too short, return the sentences as bullet points directly
    return {
      bullets: cleanSentences.length > 0 ? cleanSentences : [article.title],
      text: article.description || "No further details available for summary."
    };
  }

  // 1. Calculate word frequencies (excluding stopwords & numbers)
  const wordFreq = {};
  const words = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"")
    .split(/\s+/);

  words.forEach(word => {
    if (word.length > 2 && !STOPWORDS.has(word) && isNaN(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // 2. Score sentences based on word frequencies
  const sentenceScores = cleanSentences.map((sentence, idx) => {
    const sWords = sentence.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"")
      .split(/\s+/);
    
    let score = 0;
    sWords.forEach(word => {
      if (wordFreq[word]) {
        score += wordFreq[word];
      }
    });

    // Penalize extremely long or short sentences slightly, score by density
    const scoreNormalized = score / (sWords.length + 1);
    return { index: idx, text: sentence, score: scoreNormalized };
  });

  // 3. Sort sentences by score to get key points
  const sortedSentences = [...sentenceScores].sort((a, b) => b.score - a.score);
  
  // Get top 3 key points
  const topPoints = sortedSentences.slice(0, 3)
    .sort((a, b) => a.index - b.index) // Restore original reading order
    .map(item => item.text);

  // 4. Create a concise summary paragraph (using sentences that did not make the top 3 bullet list)
  const nonBulletSentences = sentenceScores
    .filter(s => !topPoints.includes(s.text))
    .slice(0, 2)
    .map(s => s.text)
    .join(" ");

  const paragraphSummary = nonBulletSentences || article.description;

  return {
    bullets: topPoints,
    text: paragraphSummary
  };
}

// ==========================================================================
// 6. Google Gemini AI Summarization Client
// ==========================================================================
async function generateGeminiSummary(article) {
  if (!state.geminiKey) {
    throw new Error("No Gemini API key configured. Please enter one in settings.");
  }

  const prompt = `Summarize the following Indian news article. Provide exactly 3 short, high-impact bullet points and a one-sentence summary paragraph. 
  You MUST return your output strictly in JSON format matching this schema: 
  {
    "bullets": ["short bullet point 1", "short bullet point 2", "short bullet point 3"],
    "text": "one sentence summary paragraph summarizing the narrative."
  }
  
  Do not include any markdown format tags like \`\`\`json or surrounding text. Just return the clean JSON string.
  
  Article Title: ${article.title}
  Article Publisher: ${article.source}
  Article Snippet: ${article.content || article.description}`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${state.geminiKey}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData?.error?.message || "Gemini API request failed.");
  }

  const data = await response.json();
  const rawResponseText = data.candidates[0].content.parts[0].text;
  
  // Parse structured JSON response
  try {
    const summaryData = JSON.parse(rawResponseText.trim());
    if (summaryData.bullets && Array.isArray(summaryData.bullets) && summaryData.text) {
      return summaryData;
    }
    throw new Error("Response structure did not match expected bullets format.");
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini, using simple text wrapper:", rawResponseText);
    // Fallback parser if JSON failed but response was textual
    const points = rawResponseText.split('\n')
      .map(p => p.replace(/^[-*•]\s+/, '').trim())
      .filter(p => p.length > 0);
    return {
      bullets: points.slice(0, 3),
      text: points.slice(3).join(" ") || article.description
    };
  }
}

// Validate Gemini API Key on Configuration Save
async function validateGeminiKey(key) {
  const prompt = "Reply with 'Ok'.";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  return response.ok;
}

// ==========================================================================
// 7. UI Rendering & Interactions
// ==========================================================================

// Render current filtered list of articles
function renderArticles() {
  const gridContainer = document.getElementById("news-grid");
  const emptyState = document.getElementById("empty-state");
  gridContainer.innerHTML = "";

  // Apply filters
  const filtered = state.articles.filter(article => {
    // Category Filter
    if (state.activeCategory !== 'all' && article.category !== state.activeCategory) return false;
    
    // Source Filter
    if (state.activeSource !== 'all' && article.sourceKey !== state.activeSource) return false;
    
    // Search Query Filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      const inTitle = article.title.toLowerCase().includes(query);
      const inDesc = article.description.toLowerCase().includes(query);
      const inContent = article.content.toLowerCase().includes(query);
      if (!inTitle && !inDesc && !inContent) return false;
    }

    // Bookmarked/Saved Toggle Filter
    if (state.showSavedOnly && !state.bookmarks.includes(article.id)) return false;

    return true;
  });

  // Render articles or empty state
  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
    gridContainer.classList.add("hidden");
    
    // Customize empty text message
    const emptyMsg = document.getElementById("empty-message");
    if (state.showSavedOnly) {
      emptyMsg.innerText = "You haven't bookmarked any news articles yet. Click the bookmark icon on cards to save summaries!";
    } else {
      emptyMsg.innerText = "We couldn't find any articles matching your search query or source filters. Try clearing inputs or selecting 'All News'.";
    }
  } else {
    emptyState.classList.add("hidden");
    gridContainer.classList.remove("hidden");

    filtered.forEach(article => {
      const isSaved = state.bookmarks.includes(article.id);
      const relativeTime = getRelativeTime(article.pubDate);
      
      const card = document.createElement("div");
      card.className = "news-card";
      card.setAttribute("data-id", article.id);
      
      card.innerHTML = `
        <div class="card-header">
          <span class="source-badge ${article.sourceKey}">${article.source}</span>
          <span class="time-ago">${relativeTime}</span>
        </div>
        <h3 class="card-title">${article.title}</h3>
        <p class="card-snippet">${article.description}</p>
        <div class="card-footer">
          <button class="read-btn">
            <span>Read Summary</span>
            <i data-lucide="arrow-right"></i>
          </button>
          <button class="bookmark-icon-btn ${isSaved ? 'saved' : ''}" title="${isSaved ? 'Remove from Saved' : 'Save News'}">
            <i data-lucide="bookmark"></i>
          </button>
        </div>
      `;

      // Event: Clicking card itself opens details modal
      card.addEventListener("click", (e) => {
        // Prevent click if clicking the bookmark button
        if (e.target.closest(".bookmark-icon-btn")) {
          e.stopPropagation();
          toggleBookmark(article.id);
          return;
        }
        openDetailsModal(article);
      });

      gridContainer.appendChild(card);
    });

    // Trigger Lucide icons rendering for newly generated elements
    lucide.createIcons();
  }

  // Update counts in header badge
  document.getElementById("bookmark-count").innerText = state.bookmarks.length;
}

// Update the top sync banner
function updateStatusUI(message, isLoading) {
  const banner = document.getElementById("status-banner");
  const textEl = document.getElementById("status-text");
  const refreshBtn = document.getElementById("refresh-news");
  
  textEl.innerText = message;
  
  if (isLoading) {
    refreshBtn.classList.add("loading");
    refreshBtn.disabled = true;
  } else {
    refreshBtn.classList.remove("loading");
    refreshBtn.disabled = false;
  }
}

// Toggle saved bookmark list and save to storage
function toggleBookmark(id) {
  const index = state.bookmarks.indexOf(id);
  if (index > -1) {
    state.bookmarks.splice(index, 1);
  } else {
    state.bookmarks.push(id);
  }
  
  // Save state
  localStorage.setItem('saved_news_bookmarks', JSON.stringify(state.bookmarks));
  
  // Re-render
  renderArticles();
  
  // If modal detail view is open, update its bookmark button state too
  if (state.selectedArticle && state.selectedArticle.id === id) {
    updateModalBookmarkBtn(id);
  }
}

// Update modal's bookmark button appearance
function updateModalBookmarkBtn(id) {
  const btn = document.getElementById("modal-bookmark-btn");
  const isSaved = state.bookmarks.includes(id);
  
  if (isSaved) {
    btn.classList.add("saved");
    btn.querySelector("span").innerText = "Saved to Bookmarks";
  } else {
    btn.classList.remove("saved");
    btn.querySelector("span").innerText = "Save Article";
  }
}

// Open Details Modal with Summarizer engine
function openDetailsModal(article) {
  state.selectedArticle = article;
  
  const modal = document.getElementById("details-modal");
  const headline = document.getElementById("modal-headline");
  const sourceBadge = document.getElementById("modal-source-badge");
  const pubDate = document.getElementById("modal-pub-date");
  const contentText = document.getElementById("modal-content-text");
  const sourceLink = document.getElementById("modal-source-link");
  const regenButton = document.getElementById("regenerate-ai-summary");
  const badgeText = document.getElementById("summary-badge-text");

  // Load basic article metadata
  headline.innerText = article.title;
  sourceBadge.className = `source-badge ${article.sourceKey}`;
  sourceBadge.innerText = article.source;
  pubDate.innerText = getRelativeTime(article.pubDate);
  contentText.innerText = article.content || article.description;
  sourceLink.href = article.link;

  updateModalBookmarkBtn(article.id);

  // Set default Local Summary UI
  const localSummary = generateLocalSummary(article);
  badgeText.innerText = "Smart Summary (Local)";
  displaySummary(localSummary);
  
  // Manage AI Summary trigger
  if (state.geminiKey) {
    regenButton.querySelector("span").innerText = "AI Summary";
    regenButton.style.display = "flex";
  } else {
    regenButton.querySelector("span").innerText = "Unlock AI";
    regenButton.style.display = "flex";
  }

  // Display details modal
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Prevent background scroll
}

// Render bullets and text into detail summary card
function displaySummary(summaryObj) {
  const bulletsContainer = document.getElementById("modal-summary-bullets");
  const textContainer = document.getElementById("modal-summary-text");
  
  bulletsContainer.innerHTML = "";
  
  summaryObj.bullets.forEach(bullet => {
    const li = document.createElement("li");
    li.innerText = bullet;
    bulletsContainer.appendChild(li);
  });
  
  textContainer.innerText = summaryObj.text;
}

// Close Modals helper
function closeAllModals() {
  document.getElementById("details-modal").classList.add("hidden");
  document.getElementById("settings-modal").classList.add("hidden");
  document.body.style.overflow = "auto";
  state.selectedArticle = null;
}

// Request AI Summary
async function triggerAiSummary() {
  const regenButton = document.getElementById("regenerate-ai-summary");
  const badgeText = document.getElementById("summary-badge-text");
  
  if (!state.geminiKey) {
    // Redirect user to Settings modal to enter API key
    closeAllModals();
    document.getElementById("settings-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
    
    const statusEl = document.getElementById("key-status-indicator");
    statusEl.className = "status-indicator error";
    statusEl.innerText = "Please input a Gemini API Key to enable AI summarizing.";
    return;
  }

  // Show loading state
  regenButton.disabled = true;
  regenButton.innerHTML = `<i data-lucide="sparkles" class="loading-spin" style="animation: spin 1s linear infinite;"></i> <span>Generating...</span>`;
  lucide.createIcons();
  
  try {
    const aiSummary = await generateGeminiSummary(state.selectedArticle);
    badgeText.innerText = "Gemini AI Summary";
    displaySummary(aiSummary);
  } catch (err) {
    console.error("AI Summary failed: ", err);
    alert("AI Summarization failed: " + err.message + "\nFalling back to Smart Local Summary.");
  } finally {
    // Restore button
    regenButton.disabled = false;
    regenButton.innerHTML = `<i data-lucide="brain"></i> <span>AI Summary</span>`;
    lucide.createIcons();
  }
}

// ==========================================================================
// 8. Event Listener Registrations
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Initial icons draw
  lucide.createIcons();
  
  // Sync live feeds
  fetchNews();

  // Search input handler
  const searchInput = document.getElementById("news-search");
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderArticles();
  });

  // Saved Articles Navigation Toggle
  const bookmarksBtn = document.getElementById("toggle-bookmarks");
  bookmarksBtn.addEventListener("click", () => {
    state.showSavedOnly = !state.showSavedOnly;
    if (state.showSavedOnly) {
      bookmarksBtn.classList.add("active");
    } else {
      bookmarksBtn.classList.remove("active");
    }
    renderArticles();
  });

  // Source filters click handler
  const sourceTabs = document.getElementById("source-tabs");
  sourceTabs.addEventListener("click", (e) => {
    const target = e.target.closest(".tab-btn");
    if (!target) return;
    
    // Switch active state
    sourceTabs.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    target.classList.add("active");
    
    state.activeSource = target.getAttribute("data-source");
    renderArticles();
  });

  // Category filters click handler
  const categoryTabs = document.getElementById("category-tabs");
  categoryTabs.addEventListener("click", (e) => {
    const target = e.target.closest(".tab-btn");
    if (!target) return;
    
    // Switch active state
    categoryTabs.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    target.classList.add("active");
    
    state.activeCategory = target.getAttribute("data-category");
    renderArticles();
  });

  // Refresh news button click
  document.getElementById("refresh-news").addEventListener("click", fetchNews);
  
  // Reset filter empty state button
  document.getElementById("reset-filters").addEventListener("click", () => {
    state.activeCategory = 'all';
    state.activeSource = 'all';
    state.searchQuery = '';
    state.showSavedOnly = false;
    
    // Reset inputs & buttons class active status
    document.getElementById("news-search").value = '';
    bookmarksBtn.classList.remove("active");
    
    sourceTabs.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    sourceTabs.querySelector('[data-source="all"]').classList.add("active");
    
    categoryTabs.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    categoryTabs.querySelector('[data-category="all"]').classList.add("active");
    
    renderArticles();
  });

  // Modal Closures
  document.getElementById("close-details").addEventListener("click", closeAllModals);
  document.getElementById("close-settings").addEventListener("click", closeAllModals);
  document.getElementById("cancel-settings-btn").addEventListener("click", closeAllModals);
  
  // Clicking overlay closes active modals
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // Key Event Modal bookmark toggle
  document.getElementById("modal-bookmark-btn").addEventListener("click", () => {
    if (state.selectedArticle) {
      toggleBookmark(state.selectedArticle.id);
    }
  });

  // Trigger Gemini AI Summary in Modal
  document.getElementById("regenerate-ai-summary").addEventListener("click", triggerAiSummary);

  // Settings Actions
  const settingsModal = document.getElementById("settings-modal");
  const keyInput = document.getElementById("gemini-key");
  const saveKeyBtn = document.getElementById("save-settings-btn");
  const clearKeyBtn = document.getElementById("clear-settings-btn");
  const keyStatusEl = document.getElementById("key-status-indicator");
  const toggleKeyVisibilityBtn = document.getElementById("toggle-key-visibility");

  // Show settings
  document.getElementById("open-settings").addEventListener("click", () => {
    keyInput.value = state.geminiKey;
    keyStatusEl.className = "status-indicator";
    keyStatusEl.style.display = "none";
    settingsModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  // Hide/Show password letters
  toggleKeyVisibilityBtn.addEventListener("click", () => {
    const isPass = keyInput.type === "password";
    keyInput.type = isPass ? "text" : "password";
    toggleKeyVisibilityBtn.querySelector("i").setAttribute("data-lucide", isPass ? "eye-off" : "eye");
    lucide.createIcons();
  });

  // Save Settings configuration
  saveKeyBtn.addEventListener("click", async () => {
    const key = keyInput.value.trim();
    if (!key) {
      keyStatusEl.className = "status-indicator error";
      keyStatusEl.innerText = "Please input a valid key or press Cancel.";
      return;
    }

    keyStatusEl.className = "status-indicator";
    keyStatusEl.innerText = "Verifying API key connectivity with Google...";
    keyStatusEl.style.display = "block";
    saveKeyBtn.disabled = true;

    try {
      const isValid = await validateGeminiKey(key);
      if (isValid) {
        state.geminiKey = key;
        localStorage.setItem('gemini_api_key', key);
        keyStatusEl.className = "status-indicator success";
        keyStatusEl.innerText = "Key successfully verified and saved!";
        
        // Wait and close
        setTimeout(() => {
          closeAllModals();
        }, 1200);
      } else {
        keyStatusEl.className = "status-indicator error";
        keyStatusEl.innerText = "Verification failed. Check the key details and try again.";
      }
    } catch (e) {
      keyStatusEl.className = "status-indicator error";
      keyStatusEl.innerText = "Connection error: " + e.message;
    } finally {
      saveKeyBtn.disabled = false;
    }
  });

  // Clear Saved Configuration Settings
  clearKeyBtn.addEventListener("click", () => {
    state.geminiKey = "";
    localStorage.removeItem('gemini_api_key');
    keyInput.value = "";
    keyStatusEl.className = "status-indicator success";
    keyStatusEl.innerText = "Configuration cleared successfully.";
    
    setTimeout(() => {
      closeAllModals();
    }, 1000);
  });
});
