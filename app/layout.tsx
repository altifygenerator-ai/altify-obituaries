import "./globals.css";
export const metadata = {
  title: "Altify Obituaries",
  description: "AI-powered obituary generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        <nav
          style={{
            padding: "15px 20px",
            borderBottom: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <strong>Altify</strong>

          <div>
            <a href="/" style={{ marginRight: 15 }}>
              Home
            </a>
            <a href="/dashboard" style={{ marginRight: 15 }}>
              Dashboard
            </a>
            <a href="/login">Login</a>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
