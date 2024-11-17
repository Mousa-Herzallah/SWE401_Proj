class AIAnalyzer {
  comparePronunciation(spokenText, targetText) {
    let highlightedText = "";
    const maxLength = Math.max(spokenText.length, targetText.length);

    for (let i = 0; i < maxLength; i++) {
      const spokenChar = spokenText[i] || "";
      const targetChar = targetText[i] || "";

      if (spokenChar.toLowerCase() === targetChar.toLowerCase()) {
        highlightedText += spokenChar; // Correct character
      } else {
        highlightedText += `<span class="highlight">${spokenChar}</span>`; // Incorrect character
      }
    }

    return highlightedText;
  }

  generateFeedback(spokenText, targetText) {
    return this.comparePronunciation(spokenText, targetText);
  }
}

class PracticeSession {
  constructor(sessionID, sentence, date) {
    this.sessionID = sessionID; // Unique session ID
    this.sentence = sentence; // Sentence used for practice
    this.date = date; // Date of session
    this.feedback = ""; // Feedback for the session
  }

  analyzePronunciation(spokenText, targetText, analyzer) {
    this.feedback = analyzer.generateFeedback(spokenText, targetText);
    return this.feedback;
  }

  saveFeedback() {
    console.log(`Feedback for session ${this.sessionID} saved: ${this.feedback}`);
  }
}

class Progress {
  constructor(learnerID) {
    this.learnerID = learnerID;
    this.sessions = []; // List of PracticeSession objects
    this.overallScore = 0; // Placeholder for overall progress score
  }

  addSession(session) {
    this.sessions.push(session);
    console.log(`Session ${session.sessionID} added for learner ${this.learnerID}.`);
  }

  calculateProgress() {
    const totalSessions = this.sessions.length;
    if (totalSessions === 0) return 0;

    this.overallScore = this.sessions.reduce((acc, session) => acc + session.feedback.length, 0) / totalSessions;
    return this.overallScore;
  }

  viewProgress() {
    console.log(`Progress for learner ${this.learnerID}:`, this.calculateProgress());
  }
}

class Learner {
  constructor(userID, name) {
    this.userID = userID;
    this.name = name;
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.recognition.lang = 'en-US';
    this.progress = new Progress(userID); // Track progress
    this.analyzer = new AIAnalyzer(); // AI Analyzer for comparison and feedback
  }

  recordPronunciation() {
    console.log("Speech recognition started...");
    const sessionID = new Date().getTime(); // Unique session ID
    const sentence = document.getElementById('targetText').value.trim();
    const session = new PracticeSession(sessionID, sentence, new Date());

    this.recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();
      const feedback = session.analyzePronunciation(spokenText, sentence, this.analyzer);

      document.getElementById('result').textContent = sentence;
      document.getElementById('spokenResult').innerHTML = feedback;

      session.saveFeedback();
      this.progress.addSession(session);
      this.progress.viewProgress();
    };

    this.recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
    };

    this.recognition.start();
  }

  playText() {
    const text = document.getElementById('playbackText').value;
    const selectedVoice = document.getElementById('accentSelect').value;

    fetch('http://localhost:3000/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, voice: selectedVoice }),
    })
      .then((response) => response.blob())
      .then((audioBlob) => {
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.play();
      })
      .catch((error) => console.error("Error in Text-to-Speech:", error));
  }
}

// Initialize the Learner class
const learner = new Learner("user1", "Mohammed Sami");

// Event listeners for the buttons
document.getElementById('checkPronunciationButton').addEventListener('click', () => {
  learner.recordPronunciation();
});

document.getElementById('playPronunciationButton').addEventListener('click', () => {
  learner.playText();
});
