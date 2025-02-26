import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import natural from "natural";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Function to scrape a webpage
const scrapeDocumentation = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
            }
        });

        const $ = cheerio.load(data);
        
        let content = "";
        $("article p, article h1, article h2, article h3, article li, div p, section p").each((_, element) => {
            content += $(element).text().trim() + "\n";
        });

        if (!content.trim()) {
            content = "No useful content found.";
        }

        return content.substring(0, 5000);
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return "Error fetching data.";
    }
};

// Store documentation data
let documentationData = {};

// Fetch documentation once when the server starts
const fetchAllDocs = async () => {
    documentationData = {
        "Segment": await scrapeDocumentation("https://segment.com/docs/"),
        "mParticle": await scrapeDocumentation("https://docs.mparticle.com/"),
        "Lytics": await scrapeDocumentation("https://docs.lytics.com/"),
        "Zeotap": await scrapeDocumentation("https://docs.zeotap.com/home/en-us/")
    };
    console.log("✅ Documentation data fetched successfully!");
};

fetchAllDocs();

// ✅ API route to handle user questions
app.post("/ask", (req, res) => {
    const { question } = req.body;
    
    if (!question) {
        return res.status(400).json({ error: "Please provide a question." });
    }

    let bestMatch = { platform: null, content: "", score: 0 };

    for (const platform in documentationData) {
        const docText = documentationData[platform];

        // Compute similarity using Jaro-Winkler Distance
        const similarityScore = natural.JaroWinklerDistance(question.toLowerCase(), docText.toLowerCase());

        if (similarityScore > bestMatch.score) {
            // Extract the most relevant section (based on keywords)
            const sentences = docText.split("\n");
            let bestSentence = "";

            for (const sentence of sentences) {
                if (
                    sentence.toLowerCase().includes(question.toLowerCase().split(" ")[0]) &&
                    sentence.length > 10
                ) {
                    bestSentence = sentence;
                    break;
                }
            }

            bestMatch = {
                platform,
                content: bestSentence || docText.substring(0, 500),
                score: similarityScore,
            };
        }
    }

    if (bestMatch.platform) {
        res.json({
            platform: bestMatch.platform,
            response: bestMatch.content || "No detailed answer found, but you can refer to the documentation.",
        });
    } else {
        res.json({ response: "Sorry, I couldn't find an answer." });
    }
});

// ✅ Default route to check if API is running
app.get("/", (req, res) => {
    res.json({ message: "CDP Chatbot API is running!" });
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));







