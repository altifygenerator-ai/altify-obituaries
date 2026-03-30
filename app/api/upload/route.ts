import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 🔹 Convert file → base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // 🔹 STEP 1: Upload to PDF.co
    const uploadRes = await fetch("https://api.pdf.co/v1/file/upload/base64", {
      method: "POST",
      headers: {
        "x-api-key": process.env.PDFCO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64,
        name: file.name,
      }),
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.url) {
      console.error("UPLOAD ERROR:", uploadData);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // 🔹 STEP 2: Convert PDF → text
    const pdfRes = await fetch("https://api.pdf.co/v1/pdf/convert/to/text", {
      method: "POST",
      headers: {
        "x-api-key": process.env.PDFCO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: uploadData.url,
        inline: true,
      }),
    });

    const pdfData = await pdfRes.json();

    if (!pdfRes.ok) {
      console.error("PDF ERROR:", pdfData);
      return NextResponse.json(
        { error: "PDF extraction failed" },
        { status: 500 }
      );
    }

    const text = pdfData.body || "";

    if (!text) {
      return NextResponse.json(
        { error: "No text extracted" },
        { status: 400 }
      );
    }

    // 🔹 STEP 3: Send to OpenAI for structure
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Extract full_name, age, date_of_birth, date_of_death, life_summary. Return ONLY valid JSON.",
          },
          {
            role: "user",
            content: text.slice(0, 12000),
          },
        ],
      }),
    });

    const aiData = await aiRes.json();

    let structured = {};
    try {
      structured = JSON.parse(
        aiData?.choices?.[0]?.message?.content || "{}"
      );
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
    }

    return NextResponse.json({ structured });

  } catch (err) {
    console.error("UPLOAD ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}