function LanguageSelector({ language, onChange }) {
  return (
    <div style={styles.container}>
      <label style={styles.label}>Language / भाषा:</label>
      <select
        value={language}
        onChange={(e) => onChange(e.target.value)}
        style={styles.select}
      >
        <option value="en-IN">English (India)</option>
        <option value="hi-IN">हिन्दी (Hindi)</option>
      </select>
    </div>
  );
}

const styles = {
  container: {
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  label: {
    fontWeight: "600",
    color: "#2c3e50",
  },
  select: {
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    border: "1px solid #bdc3c7",
    fontSize: "1rem",
    cursor: "pointer",
  },
};

export default LanguageSelector;
