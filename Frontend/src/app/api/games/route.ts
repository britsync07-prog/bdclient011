import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export async function GET() {
  try {
    // In a real app, we'd pass the JWT here. 
    // For this local setup, we'll allow an unauthenticated "guest" fetch or mock it.
    // However, I've made it protected on the backend. 
    // Let's assume for now the frontend handles the login and sets the token.
    
    // For the "see the website" part without login, let's add a public endpoint to the backend 
    // or just fetch from the protected one if we have a token.
    
    // For now, I'll fetch from the backend. 
    const res = await fetch(`${BACKEND_URL}/user/games`);
    const data = await res.json();
    
    if (data.games) {
      return NextResponse.json({ games: data.games });
    }
    
    return NextResponse.json({ error: "Failed to fetch games from backend" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
