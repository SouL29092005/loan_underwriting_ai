function ResultCard({ result, language }) {
  const labels = {
    "en-IN": {
      approved: "Loan Approved ✅",
      rejected: "Loan Not Approved ❌",
      confidence: "Confidence",
      reasons: "Reasons",
      suggestions: "Next Steps",
      applyAgain: "Apply Again",
    },
    "hi-IN": {
      approved: "लोन स्वीकृत ✅",
      rejected: "लोन स्वीकृत नहीं ❌",
      confidence: "विश्वास",
      reasons: "कारण",
      suggestions: "अगला कदम",
      applyAgain: "दोबारा आवेदन करें",
    },
  };

  const lang = labels[language] || labels["en-IN"];
  const isApproved = result.approved;

  return (
    <div
      style={{
        ...styles.card,
        borderLeftColor: isApproved ? "#27ae60" : "#e74c3c",
        backgroundColor: isApproved ? "#d5f4e6" : "#fadbd8",
      }}
    >
      <h2 style={{ ...styles.title, color: isApproved ? "#27ae60" : "#e74c3c" }}>
        {isApproved ? lang.approved : lang.rejected}
      </h2>

      <div style={styles.details}>
        <p style={styles.detailRow}>
          <strong>{lang.confidence}:</strong> {result.confidence}%
        </p>

        {result.explanation?.reasons && result.explanation.reasons.length > 0 && (
          <div>
            <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
              {lang.reasons}:
            </p>
            <ul style={styles.list}>
              {result.explanation.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {result.explanation?.suggestions &&
          result.explanation.suggestions.length > 0 && (
            <div>
              <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                {lang.suggestions}:
              </p>
              <ul style={styles.list}>
                {result.explanation.suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    borderLeft: "4px solid",
    borderRadius: "8px",
    padding: "2rem",
    marginTop: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "1.5rem",
    margin: "0 0 1rem 0",
  },
  details: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  detailRow: {
    margin: "0.5rem 0",
    fontSize: "1rem",
  },
  list: {
    marginLeft: "1.5rem",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  },
};

export default ResultCard;
