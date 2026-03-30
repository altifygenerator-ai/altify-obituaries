import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("usage_count, subscription_status")
      .eq("id", user.id)
      .single();

    const usage = profile?.usage_count || 0;
    const isPro = profile?.subscription_status === "active";

    if (!isPro && usage >= 3) {
      return NextResponse.json(
        { error: "Free limit reached" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const text = formData.get("text") as string;

    if (!text) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

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

Write a respectful, compassionate, and well-structured obituary.
- 3–5 paragraphs
- Include personality, life story, and legacy
- Avoid clichés
- Make it feel human and personal
`,
          },
          { role: "user", content: text },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error("OpenAI Error:", errorText);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await aiRes.json();

    const obituary = data.choices?.[0]?.message?.content || "";

    if (!obituary) {
      return NextResponse.json({ error: "No content generated" }, { status: 500 });
    }

    await supabase
      .from("users")
      .update({ usage_count: usage + 1 })
      .eq("id", user.id);

    return NextResponse.json({ obituary });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}