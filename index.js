import express from "express";
import cors from "cors";
import "dotenv/config";

import { askOpenAI } from "./providers/openai.js";
import { askGroq } from "./providers/groq.js";
import { askGemini } from "./providers/gemini.js";
import { askHF } from "./providers/huggingface.js";
import { askOpenRouter } from "./providers/openrouter.js";
import { askMistral } from "./providers/mistral.js";
import { getTrivia } from "./trivia.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.send("AI Backend Live 🚀"));

app.post("/chat", async (req, res) => {
  try {
    const { provider, model, message } = req.body;

    // Trivia trigger
    if (/give me\s+\d+\s+(gk|questions)/i.test(message)) {
      const count = parseInt(message.match(/\d+/)?.[0] || "10", 10);
      return res.json({ reply: await getTrivia(count) });
    }

    let reply = "";
    switch (provider) {
      case "openai":      reply = await askOpenAI(message, model); break;
      case "groq":        reply = await askGroq(message, model); break;
      case "gemini":      reply = await askGemini(message, model); break;
      case "huggingface": reply = await askHF(message, model); break;
      case "openrouter":  reply = await askOpenRouter(message, model); break;
      case "mistral":     reply = await askMistral(message, model); break;
      default: throw new Error("Unknown provider");
    }
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
