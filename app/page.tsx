export default function Home() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Professional Obituaries in Minutes</h1>

      <p style={{ marginTop: 10, color: "#555" }}>
        By Altify
      </p>

      <p style={{ maxWidth: 500, margin: "20px auto" }}>
        Create clear, respectful obituaries quickly using simple inputs
        or uploaded documents. Designed for families and professionals.
      </p>

      <a
        href="/dashboard"
        style={{
          padding: "12px 20px",
          background: "black",
          color: "white",
          textDecoration: "none",
          borderRadius: 6,
        }}
      >
        Get Started
      </a>
    </div>
  );
}