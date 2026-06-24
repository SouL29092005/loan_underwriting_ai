import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mlApi } from "../services/api";

function LoanForm({ language }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    no_of_dependents: 0,
    education: "Graduate",
    self_employed: "No",
    income_annum: "",
    loan_amount: "",
    loan_term: "",
    cibil_score: "",
    residential_assets_value: 0,
    commercial_assets_value: 0,
    luxury_assets_value: 0,
    bank_asset_value: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Convert string values to numbers, keep categorical fields as strings
      const payload = {
        no_of_dependents: parseInt(formData.no_of_dependents),
        education: formData.education,
        self_employed: formData.self_employed,
        income_annum: parseInt(formData.income_annum),
        loan_amount: parseInt(formData.loan_amount),
        loan_term: parseInt(formData.loan_term),
        cibil_score: parseInt(formData.cibil_score),
        residential_assets_value: parseInt(
          formData.residential_assets_value || 0
        ),
        commercial_assets_value: parseInt(
          formData.commercial_assets_value || 0
        ),
        luxury_assets_value: parseInt(formData.luxury_assets_value || 0),
        bank_asset_value: parseInt(formData.bank_asset_value || 0),
      };

      const response = await mlApi.post("/predict", payload);

      navigate("/result", {
        state: response.data,
      });
    } catch (err) {
      console.error("Prediction error:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to get prediction. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    "en-IN": {
      dependents: "Number of Dependents",
      education: "Education",
      selfEmployed: "Self Employed?",
      income: "Annual Income (₹)",
      loanAmount: "Loan Amount (₹)",
      loanTerm: "Loan Term (months)",
      cibil: "CIBIL Score",
      residential: "Residential Assets (₹)",
      commercial: "Commercial Assets (₹)",
      luxury: "Luxury Assets (₹)",
      bank: "Bank Assets (₹)",
      submit: "Check Eligibility",
    },
    "hi-IN": {
      dependents: "आश्रितों की संख्या",
      education: "शिक्षा",
      selfEmployed: "स्वरोजगार?",
      income: "वार्षिक आय (₹)",
      loanAmount: "लोन राशि (₹)",
      loanTerm: "लोन अवधि (महीने)",
      cibil: "CIBIL स्कोर",
      residential: "आवासीय संपत्ति (₹)",
      commercial: "वाणिज्यिक संपत्ति (₹)",
      luxury: "विलासितापूर्ण संपत्ति (₹)",
      bank: "बैंक संपत्ति (₹)",
      submit: "पात्रता जांचें",
    },
  };

  const lang = labels[language] || labels["en-IN"];

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.row}>
        <div style={styles.field}>
          <label>{lang.dependents}</label>
          <input
            type="number"
            name="no_of_dependents"
            value={formData.no_of_dependents}
            onChange={handleChange}
            min="0"
            max="10"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>{lang.education}</label>
          <select
            name="education"
            value={formData.education}
            onChange={handleChange}
            style={styles.input}
          >
            <option>Graduate</option>
            <option>Not Graduate</option>
          </select>
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label>{lang.selfEmployed}</label>
          <select
            name="self_employed"
            value={formData.self_employed}
            onChange={handleChange}
            style={styles.input}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div style={styles.field}>
          <label>{lang.cibil}</label>
          <input
            type="number"
            name="cibil_score"
            value={formData.cibil_score}
            onChange={handleChange}
            placeholder="300-900"
            style={styles.input}
            required
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label>{lang.income}</label>
          <input
            type="number"
            name="income_annum"
            value={formData.income_annum}
            onChange={handleChange}
            placeholder="e.g., 500000"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.field}>
          <label>{lang.loanAmount}</label>
          <input
            type="number"
            name="loan_amount"
            value={formData.loan_amount}
            onChange={handleChange}
            placeholder="e.g., 200000"
            style={styles.input}
            required
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label>{lang.loanTerm}</label>
          <input
            type="number"
            name="loan_term"
            value={formData.loan_term}
            onChange={handleChange}
            placeholder="e.g., 60"
            style={styles.input}
            required
          />
        </div>
      </div>

      <fieldset style={styles.fieldset}>
        <legend>Assets (Optional)</legend>
        <div style={styles.row}>
          <div style={styles.field}>
            <label>{lang.residential}</label>
            <input
              type="number"
              name="residential_assets_value"
              value={formData.residential_assets_value}
              onChange={handleChange}
              placeholder="0"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>{lang.commercial}</label>
            <input
              type="number"
              name="commercial_assets_value"
              value={formData.commercial_assets_value}
              onChange={handleChange}
              placeholder="0"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label>{lang.luxury}</label>
            <input
              type="number"
              name="luxury_assets_value"
              value={formData.luxury_assets_value}
              onChange={handleChange}
              placeholder="0"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>{lang.bank}</label>
            <input
              type="number"
              name="bank_asset_value"
              value={formData.bank_asset_value}
              onChange={handleChange}
              placeholder="0"
              style={styles.input}
            />
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Checking..." : lang.submit}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    backgroundColor: "#f8f9fa",
    padding: "2rem",
    borderRadius: "8px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #bdc3c7",
    borderRadius: "4px",
    fontSize: "1rem",
    fontFamily: "inherit",
  },
  fieldset: {
    border: "1px solid #bdc3c7",
    borderRadius: "4px",
    padding: "1rem",
    backgroundColor: "#fff",
  },
  button: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  error: {
    padding: "1rem",
    backgroundColor: "#e74c3c",
    color: "white",
    borderRadius: "4px",
    marginBottom: "1rem",
  },
};

export default LoanForm;
