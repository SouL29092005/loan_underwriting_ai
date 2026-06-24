import { useState, useCallback } from "react";

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("");
  const [transcript, setTranscript] = useState("");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Speech Recognition not supported in this browser");
  }

  const speak = useCallback((text, lang = "en-IN") => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const listenOnce = useCallback(
    (lang = "en-IN") => {
      return new Promise((resolve, reject) => {
        if (!SpeechRecognition) {
          reject(new Error("Speech Recognition not supported"));
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setStatus("Listening...");
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          resolve(transcript);
        };

        recognition.onerror = (event) => {
          setStatus(`Error: ${event.error}`);
          reject(new Error(event.error));
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      });
    },
    [SpeechRecognition]
  );

  const captureNumber = useCallback(
    async (lang, prompt, parser = "number") => {
      speak(prompt, lang);
      setStatus(prompt);

      try {
        const raw = await listenOnce(lang);
        let val = raw;

        if (parser === "number") {
          const matches = raw.replace(/[^0-9.]/g, "");
          val = matches ? parseFloat(matches) : NaN;
        } else if (parser === "ratio") {
          const matches = raw.replace(/[^0-9.]/g, "");
          if (!matches) {
            val = NaN;
          } else {
            const num = parseFloat(matches);
            val = num > 1 ? num / 100 : num;
          }
        }

        return { raw, val };
      } catch (error) {
        setStatus(`Error: ${error.message}`);
        throw error;
      }
    },
    [speak, listenOnce]
  );

  return {
    isListening,
    status,
    transcript,
    speak,
    listenOnce,
    captureNumber,
    setStatus,
  };
};
