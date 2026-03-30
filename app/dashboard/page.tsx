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

  // 📄 PDF Upload → Autofill
  const handleUpload = async () => {
    if (!file) return alert("Select a PDF");

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

  // 🤖 Generate obituary
 const handleGenerate = async () => {
  setLoading(true);

  try {
    const formData = new FormData();

    formData.append("full_name", structured.full_name || "");
    formData.append("age", structured.age || "");
    formData.append("date_of_birth", structured.date_of_birth || "");
    formData.append("date_of_death", structured.date_of_death || "");
    formData.append("life_summary", structured.life_summary || "");

    const res = await fetch("/api/generate", {
      method: "POST",
      body: formData, // ✅ THIS IS CRITICAL
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Generate failed");
      return;
    }

    setResult(data.obituary);

  } catch (err) {
    console.error(err);
    alert("Generate failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <h1>Altify Obituaries</h1>

      {/* 📄 Upload */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Autofilling..." : "Autofill from PDF"}
        </button>
      </div>

      {/* ✍️ Manual Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
          onChange={(e) =>
            handleChange("date_of_birth", e.target.value)
          }
        />

        <input
          placeholder="Date of Death"
          value={structured.date_of_death}
          onChange={(e) =>
            handleChange("date_of_death", e.target.value)
          }
        />

        <textarea
          placeholder="Life Summary"
          value={structured.life_summary}
          onChange={(e) =>
            handleChange("life_summary", e.target.value)
          }
          rows={5}
        />
      </div>

      {/* 🤖 Generate */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{ marginTop: 20 }}
      >
        {loading ? "Generating..." : "Generate Obituary"}
      </button>

      {/* 📜 Result */}
      {result && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <h3>Generated Obituary</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{result}</p>
        </div>
      )}
    </div>
  );
}