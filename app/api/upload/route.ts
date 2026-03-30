import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log("UPLOAD HIT");

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    // 👉 TEMP: read raw text from file (basic fallback)
    const text = await file.text();

    console.log("TEXT LENGTH:", text.length);

    // 🤖 Send TEXT to AI (NOT file)
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
      content: text,
    },
  ],
}),
})
    const data = await aiRes.json();

    console.log("AI RESPONSE:", data);

    let structured = {};
    try {
      structured = JSON.parse(
        data?.choices?.[0]?.message?.content || "{}"
      );
    } catch {}

    return NextResponse.json({ structured });

  } catch (err: any) {
    console.error("UPLOAD CRASH:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}