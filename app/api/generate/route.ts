import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const full_name = formData.get("full_name") as string;
    const age = formData.get("age") as string;
    const date_of_birth = formData.get("date_of_birth") as string;
    const date_of_death = formData.get("date_of_death") as string;
    const life_summary = formData.get("life_summary") as string;

    if (!full_name || !life_summary) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `
Name: ${full_name}
Age: ${age}
Date of Birth: ${date_of_birth}
Date of Death: ${date_of_death}
Life Summary: ${life_summary}
`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are a professional obituary writer.

Write a meaningful obituary:
- 3–5 paragraphs
- Warm, respectful tone
- Include life story and legacy
- Avoid clichés
`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await aiRes.json();

    if (!aiRes.ok) {
      console.error("AI ERROR:", data);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }

    const obituary =
      data?.choices?.[0]?.message?.content || "";

    return NextResponse.json({ obituary });

  } catch (err) {
    console.error("GENERATE ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}