"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Structured = {
  full_name: string;
  age: string;
  date_of_birth: string;
  date_of_death: string;
  life_summary: string;
};

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);

  const [structured, setStructured] = useState<Structured>({
    full_name: "",
    age: "",
    date_of_birth: "",
    date_of_death: "",
    life_summary: "",
  });

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [session, setSession] = useState<any>(null);

  // 🔐 get session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, []);

  // ✍️ handle input
  const handleChange = (field: keyof Structured, value: string) => {
    setStructured((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 📄 autofill from PDF
  const handleUpload = async () => {
    if (!file) {
      alert("Select a PDF first");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Upload failed");
        return;
      }

      const safe = (v: any) => v ?? "";

      setStructured({
        full_name: safe(data.structured?.full_name),
        age: safe(data.structured?.age),
        date_of_birth: safe(data.structured?.date_of_birth),
        date_of_death: safe(data.structured?.date_of_death),
        life_summary: safe(data.structured?.life_summary),
      });

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 🤖 generate obituary
  const handleGenerate = async () => {
    if (!session?.access_token) {
      alert("Login required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("text", JSON.stringify(structured));

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.status === 403) {
        alert("Free limit reached");
        return;
      }

      setResult(data.obituary || "");

    } catch (err) {
      console.error(err);
      alert("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Altify Obituaries</h1>

      <p style={styles.subtitle}>
        Upload a PDF or enter details manually to generate an obituary.
      </p>

      {/* Upload */}
      <div style={styles.uploadRow}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Autofilling..." : "Autofill from PDF"}
        </button>
      </div>

      {/* Form */}
      <div style={styles.form}>
        <input
          placeholder="Full Name"
          value={structured.full_name}
          onChange={(e) => handleChange("full_name", e.target.value)}
        />

        <input
          placeholder="Age"
          value={structured.age}
          onChange={(e) => handleChange("age", e.target.value)}
        />

        <input
          placeholder="Date of Birth"
          value={structured.date_of_birth}
          onChange={(e) => handleChange("date_of_birth", e.target.value)}
        />

        <input
          placeholder="Date of Death"
          value={structured.date_of_death}
          onChange={(e) => handleChange("date_of_death", e.target.value)}
        />

        <textarea
          placeholder="Life Summary"
          value={structured.life_summary}
          onChange={(e) => handleChange("life_summary", e.target.value)}
          rows={5}
        />
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={styles.generateBtn}
      >
        {loading ? "Generating..." : "Generate Obituary"}
      </button>

      {/* Result */}
      {result && (
        <div style={styles.resultBox}>
          <h3>Generated Obituary</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{result}</p>
        </div>
      )}
    </div>
  );
}

// 🎨 Simple clean styles
const styles = {
  container: {
    maxWidth: 700,
    margin: "0 auto",
    padding: 20,
    fontFamily: "sans-serif",
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    color: "#555",
    marginBottom: 20,
  },
  uploadRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  generateBtn: {
    marginTop: 20,
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    background: "#f5f5f5",
    borderRadius: 8,
  },
};