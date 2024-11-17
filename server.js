require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// === Classes Based on UML Diagram ===

// User Class (from the original code)
class User {
  constructor(userID, name, role) {
    this.userID = userID;
    this.name = name;
    this.role = role;
  }
}

// PracticeSession Class (from the original code)
class PracticeSession {
  constructor(sessionID, sentence, feedback) {
    this.sessionID = sessionID;
    this.sentence = sentence;
    this.feedback = feedback;
  }

  analyzePronunciation(userSpeech) {
    const sentenceWords = this.sentence.split(" ");
    const userSpeechWords = userSpeech.split(" ");
    let highlightedSpokenText = '';

    for (let i = 0; i < sentenceWords.length; i++) {
      const originalWord = sentenceWords[i] || '';
      const spokenWord = userSpeechWords[i] || '';
      highlightedSpokenText += '<span>';

      for (let j = 0; j < originalWord.length; j++) {
        if (
          spokenWord[j] &&
          (spokenWord[j].toLowerCase() === originalWord[j].toLowerCase() || spokenWord[j] === ".")
        ) {
          highlightedSpokenText += spokenWord[j]; // Correct letter or dot
        } else {
          highlightedSpokenText += `<span class="highlight">${spokenWord[j] || ''}</span>`; // Incorrect letter
        }
      }

      // Add extra letters from spoken word
      if (spokenWord.length > originalWord.length) {
        highlightedSpokenText += `<span class="highlight">${spokenWord.slice(originalWord.length)}</span>`;
      }

      highlightedSpokenText += ' </span>';
    }

    return highlightedSpokenText.trim();
  }
}

// AIAnalyzer Class (from the original code)
class AIAnalyzer {
  async synthesizeText(text, voice) {
    try {
      const response = await axios({
        method: 'post',
        url: `${process.env.IBM_URL}/v1/synthesize`,
        auth: {
          username: 'apikey',
          password: process.env.IBM_API_KEY,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'audio/wav',
        },
        data: { text },
        params: { voice },
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error) {
      console.error('IBM Watson API Error:', error.response?.data || error.message);
      throw new Error('Error synthesizing speech.');
    }
  }
}

// === Example User Instance ===
const learner = new User("1", "Mohammed Sami", "Learner");

// === API Endpoints ===

// Check Server
app.get('/api', (req, res) => {
  res.send('Server is running!');
});

// Text-to-Speech Endpoint
app.post('/synthesize', async (req, res) => {
  const { text, voice } = req.body;
  if (!text) return res.status(400).send('Text is required.');

  try {
    const aiAnalyzer = new AIAnalyzer();
    const audioData = await aiAnalyzer.synthesizeText(text, voice || 'en-US_MichaelV3Voice');
    res.set('Content-Type', 'audio/wav');
    res.send(audioData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


// Speech Recognition Endpoint
app.post('/recognize', (req, res) => {
  const { sentence, userSpeech } = req.body;
  if (!sentence || !userSpeech) {
    return res.status(400).send("Both 'sentence' and 'userSpeech' are required.");
  }

  const practiceSession = new PracticeSession("session123", sentence, "");
  const feedback = practiceSession.analyzePronunciation(userSpeech);

  res.json({ feedback });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
