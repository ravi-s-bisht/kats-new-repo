import { NextResponse } from "next/server";
import db from "../db/connection";

export async function POST(req: Request) {
  try {
    const { type, user_id, avatar_id, start_time, end_time } = await req.json();

    await db("sessionlog").insert({
      type,
      user_id,
      avatar_id,
    });

    return NextResponse.json(
      { message: "Successfully added session log." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to add to session log." },
      { status: 500 }
    );
  }
}
