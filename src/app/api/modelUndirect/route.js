import { NextResponse } from "next/server";

export async function POST(req) {
        const data = await req.json();
    try {
    
        const res = await fetch("https://api-ml-model.vercel.app/api/undirectRecommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userShare: data.data,
            key: process.env.UNDIRECT_API_KEY,
          }),
        });
    
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
    
        const result = await res.json();
    
        return NextResponse.json({
          status: "ok",
          data: result.json.data,
        });
      } catch (error) {
        return NextResponse.json(
          { status: "error", message: error.message },
          { status: 500 }
        );
    }
}