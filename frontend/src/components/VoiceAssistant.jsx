import { useCallback, useState } from "react";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";
import { mlApi } from "../services/api";

function VoiceAssistant({ language, onComplete }) {
  const { speak, captureNumber, status, setStatus } = useVoiceRecognition();
  const [isProcessing, setIsProcessing] = useState(false);

  const prompts = {
    "en-IN": {
      dependents:
        "How many dependents do you have? Say a number between 0 and 10.",
      education: "What is your education level? Say Graduate or Not Graduate.",
      selfEmployed: "Are you self employed? Say Yes or No.",
      income:
        "What is your annual income in rupees? For example, say 500000.",
      loanAmount:
        "What loan amount do you need in rupees? For example, say 200000.",
      loanTerm:
        "What is the loan term in months? For example, say 60 for 5 years.",
      cibil: "What is your CIBIL score? Say a number between 300 and 900.",
      residential:
        "What is the value of your residential assets in rupees? Say 0 if none.",
      commercial:
        "What is the value of your commercial assets in rupees? Say 0 if none.",
      luxury:
        "What is the value of your luxury assets in rupees? Say 0 if none.",
      bank: "What is the value of your bank assets in rupees? Say 0 if none.",
      checking: "Checking your eligibility...",
      approved: "Congratulations! Your loan is approved.",
      rejected: "Unfortunately, your loan application is not approved.",
    },
    "hi-IN": {
      dependents:
        "आपके कितने आश्रित हैं? 0 से 10 के बीच एक संख्या बोलें।",
      education: "आपकी शिक्षा स्तर क्या है? ग्रेजुएट या नॉट ग्रेजुएट बोलें।",
      selfEmployed: "क्या आप स्वरोजगार हैं? हां या नहीं बोलें।",
      income:
        "आपकी वार्षिक आय कितनी है (रुपयों में)? उदाहरण के लिए, 500000 बोलें।",
      loanAmount:
        "आपको कितनी लोन राशि चाहिए (रुपयों में)? उदाहरण के लिए, 200000 बोलें।",
      loanTerm:
        "लोन की अवधि कितने महीने की है? उदाहरण के लिए, 60 बोलें (5 साल के लिए)।",
      cibil:
        "आपका CIBIL स्कोर क्या है? 300 से 900 के बीच एक संख्या बोलें।",
      residential:
        "आपकी आवासीय संपत्ति का मूल्य कितना है (रुपयों में)? यदि कोई नहीं है तो 0 बोलें।",
      commercial:
        "आपकी वाणिज्यिक संपत्ति का मूल्य कितना है (रुपयों में)? यदि कोई नहीं है तो 0 बोलें।",
      luxury:
        "आपकी विलासितापूर्ण संपत्ति का मूल्य कितना है (रुपयों में)? यदि कोई नहीं है तो 0 बोलें।",
      bank: "आपकी बैंक संपत्ति का मूल्य कितना है (रुपयों में)? यदि कोई नहीं है तो 0 बोलें।",
      checking: "आपकी पात्रता जांच कर रहा हूँ...",
      approved: "बधाई हो! आपका लोन स्वीकृत है।",
      rejected: "दुर्भाग्यवश, आपका लोन आवेदन स्वीकृत नहीं है।",
    },
  };

  const labels =
    language === "hi-IN" ? prompts["hi-IN"] : prompts["en-IN"];

  const runVoiceFlow = useCallback(async () => {
    setIsProcessing(true);
    try {
      const responses = {};

      // Collect all inputs via voice
      const fields = [
        { key: "no_of_dependents", type: "number" },
        { key: "education", type: "text" },
        { key: "self_employed", type: "text" },
        { key: "income_annum", type: "number" },
        { key: "loan_amount", type: "number" },
        { key: "loan_term", type: "number" },
        { key: "cibil_score", type: "number" },
        { key: "residential_assets_value", type: "number" },
        { key: "commercial_assets_value", type: "number" },
        { key: "luxury_assets_value", type: "number" },
        { key: "bank_asset_value", type: "number" },
      ];

      for (const field of fields) {
        const labelKey =
          field.key.charAt(0).toUpperCase() +
          field.key
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim()
            .toLowerCase();

        const result = await captureNumber(
          language,
          labels[labelKey] || `Please enter ${field.key}`,
          field.type === "text" ? "text" : "number"
        );

        if (field.key === "education") {
          responses[field.key] =
            result.raw.toLowerCase().includes("graduate") && !result.raw.toLowerCase().includes("not")
              ? "Graduate"
              : "Not Graduate";
        } else if (field.key === "self_employed") {
          responses[field.key] =
            result.raw.toLowerCase().includes("yes") ? 1 : 0;
        } else {
          responses[field.key] = isNaN(result.val) ? 0 : result.val;
        }
      }

      // Send to backend
      setStatus(labels.checking);
      speak(labels.checking, language);

      const result = await mlApi.post("/predict", responses);

      // Show result
      const message = result.data.approved
        ? labels.approved
        : labels.rejected;
      setStatus(message);
      speak(message, language);

      if (onComplete) {
        onComplete(result.data);
      }
    } catch (error) {
      const errorMsg =
        language === "hi-IN"
          ? "माफ कीजिए, आवाज़ मान्यता में समस्या आई।"
          : "Sorry, voice recognition failed.";
      setStatus(`Error: ${error.message}`);
      speak(errorMsg, language);
    } finally {
      setIsProcessing(false);
    }
  }, [language, captureNumber, speak, onComplete, setStatus, labels]);

  return (
    <div style={styles.container}>
      <button
        onClick={runVoiceFlow}
        disabled={isProcessing}
        style={{
          ...styles.button,
          ...(!isProcessing ? styles.buttonHover : {}),
        }}
      >
        {isProcessing ? "🎙 Listening..." : "🎙 Start Voice Input"}
      </button>

      {status && <div style={styles.status}>{status}</div>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "center",
  },
  button: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    ":hover": {
      backgroundColor: "#2980b9",
    },
  },
  status: {
    padding: "1rem",
    backgroundColor: "#ecf0f1",
    borderRadius: "4px",
    textAlign: "center",
    minWidth: "300px",
    color: "#2c3e50",
    fontWeight: "500",
  },
};

export default VoiceAssistant;
