function Navbar() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <h1 style={styles.logo}>🏦 Smart Loan Approval System</h1>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    backgroundColor: "#2c3e50",
    color: "white",
    padding: "1rem 0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1rem",
  },
  logo: {
    margin: 0,
    fontSize: "1.5rem",
  },
};

export default Navbar;
