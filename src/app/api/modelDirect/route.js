import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const data = await req.json();

    const res = await fetch("https://api-ml-model.vercel.app/api/directRecommendation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        criteria: data.data,
        credential: process.env.DIRECT_API_KEY,
      }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const result = await res.json();

    return NextResponse.json({
      status: "ok",
      data: result.data.data,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
