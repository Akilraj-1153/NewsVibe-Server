import express from "express";
import axios from "axios";
import "dotenv/config";
import cors from "cors";

const server = express();
const PORT = process.env.PORT || 3000;

server.use(cors());
server.use(express.json());

const NEWS_API_KEY = process.env.NewsAPI;
const TOP_HEADLINES_URL = "https://newsapi.org/v2/top-headlines";
const EVERYTHING_URL = "https://newsapi.org/v2/everything";

const fetchNews = async (url, params) => {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Error fetching news"
    );
  }
};

server.post("/fetch_latest", async (req, res) => {
  const { pageno = 1 } = req.body; 

  try {
    console.log(`Fetching latest news for page ${pageno}...`);
    const newsData = await fetchNews(TOP_HEADLINES_URL, {
      apiKey: NEWS_API_KEY,
      category: "general",
      page: pageno,
    });
    res.json(newsData);
  } catch (error) {
    console.error("Error fetching latest news:", error.message);
    res.status(500).send("Error fetching latest news");
  }
});

server.post("/fetchnewsbycategory", async (req, res) => {
  const { category,pageno = 1 } = req.body; 

  if (!category) {
    return res.status(400).send("Category is required");
  }

  try {
    const newsData = await fetchNews(TOP_HEADLINES_URL, {
      apiKey: NEWS_API_KEY,
      category: category,
      page: pageno,
      pageSize: 10,
    });
    res.json(newsData);
  } catch (error) {
    console.error("Error fetching news by category:", error.message);
    res.status(500).send("Error fetching news by category");
  }
});

server.get("/HomeLatest", async (req, res) => {
  try {
    console.log("Fetching latest news for homepage...");
    const newsData = await fetchNews(TOP_HEADLINES_URL, {
      apiKey: NEWS_API_KEY,
      category: "general",
      pageSize: 10,
    });
    res.json(newsData);
  } catch (error) {
    console.error("Error fetching homepage news:", error.message);
    res.status(500).send("Error fetching homepage news");
  }
});

server.get("/fetch_trending", async (req, res) => {
  try {
    console.log("Fetching trending news...");
    const newsData = await fetchNews(TOP_HEADLINES_URL, {
      apiKey: NEWS_API_KEY,
      category: "general",
      pageSize: 20,
    });
    res.json(newsData);
  } catch (error) {
    console.error("Error fetching trending news:", error.message);
    res.status(500).send("Error fetching trending news");
  }
});




const categories = [
  "business", "entertainment", "general", "health", 
  "science", "sports", "technology"
];

const ARTICLES_PER_CATEGORY = 1;  // Number of articles to fetch per category
const MAX_ARTICLES = 20;          // Maximum number of articles to return

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

server.post("/fetch_Random", async (req, res) => {
  const { pageno = 1 } = req.body;

  try {
    console.log("Fetching mixed random news...");

    // Shuffle categories before fetching
    const shuffledCategories = shuffleArray(categories);

    // Create promises to fetch articles for each shuffled category
    const promises = shuffledCategories.map(category => {
      return fetchNews(EVERYTHING_URL, {
        apiKey: NEWS_API_KEY,
        q: category,
        page: pageno,
        pageSize: ARTICLES_PER_CATEGORY,
      });
    });

    // Wait for all category fetches to complete
    const results = await Promise.all(promises);

    // Combine all articles from each category into a single array
    const mixedArticles = results.flatMap(result => result.articles);

    // Shuffle the combined articles and take only up to MAX_ARTICLES
    const finalArticles = shuffleArray(mixedArticles).slice(0, MAX_ARTICLES);

    res.json({ articles: finalArticles });
  } catch (error) {
    console.error("Error fetching mixed random news:", error.message);
    res.status(500).json({ error: "Error fetching mixed random news" });
  }
});




server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
