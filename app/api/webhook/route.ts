import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  // ✅ HANDLE EVENTS
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    // 🔥 TODO: store subscription in Supabase
    console.log("User subscribed:", session.customer_email);
  }
if (event.type === "checkout.session.completed") {
  const session = event.data.object as any;

  const userId = session.metadata.user_id;

  await supabase.from("subscriptions").insert({
    id: session.subscription,
    user_id: userId,
    status: "active",
  });
}
  return NextResponse.json({ received: true });
}