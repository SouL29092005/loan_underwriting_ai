import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";
import LoanForm from "../components/LoanForm";
import VoiceAssistant from "../components/VoiceAssistant";

function Home() {
  const [language, setLanguage] = useState("en-IN");
  const navigate = useNavigate();

  const handleVoiceComplete = (result) => {
    navigate("/result", {
      state: result,
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <LanguageSelector language={language} onChange={setLanguage} />

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            {language === "hi-IN"
              ? "आवाज़ इनपुट के माध्यम से लोन के लिए आवेदन करें"
              : "Apply for Loan via Voice Input"}
          </h3>
          <VoiceAssistant
            language={language}
            onComplete={handleVoiceComplete}
          />
        </div>

        <div style={styles.divider}>
          <p>
            {language === "hi-IN" ? "या" : "Or"}
          </p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            {language === "hi-IN"
              ? "फॉर्म के माध्यम से लोन के लिए आवेदन करें"
              : "Apply for Loan via Form"}
          </h3>
          <LoanForm language={language} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#ecf0f1",
    padding: "2rem 1rem",
  },
  content: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  section: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    marginBottom: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "1.5rem",
    color: "#2c3e50",
    fontSize: "1.1rem",
  },
  divider: {
    textAlign: "center",
    margin: "2rem 0",
    color: "#7f8c8d",
    fontSize: "0.9rem",
  },
};

export default Home;
