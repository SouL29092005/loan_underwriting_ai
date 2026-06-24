import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";
import ResultCard from "../components/ResultCard";

function Result() {
  const [language, setLanguage] = useState("en-IN");
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state;

  if (!result) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <h2>{language === "hi-IN" ? "कोई परिणाम नहीं" : "No Result Found"}</h2>
          <p>
            {language === "hi-IN"
              ? "कृपया पहले आवेदन भरें"
              : "Please apply first"}
          </p>
          <button
            onClick={() => navigate("/")}
            style={styles.button}
          >
            {language === "hi-IN" ? "वापस जाएं" : "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <LanguageSelector language={language} onChange={setLanguage} />

        <ResultCard result={result} language={language} />

        <button
          onClick={() => navigate("/")}
          style={styles.button}
        >
          {language === "hi-IN" ? "दोबारा आवेदन करें" : "Apply Again"}
        </button>
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
  button: {
    marginTop: "2rem",
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "background-color 0.3s",
  },
};

export default Result;
