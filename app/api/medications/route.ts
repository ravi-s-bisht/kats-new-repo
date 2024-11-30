import { NextResponse } from "next/server";
import db from "../db/connection";
import moment from "moment";

export async function GET() {
  try {
    const medications = await db("medications").select("*");
    return NextResponse.json(medications, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch medications" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user_id, medication_name, reminder_time } = await req.json();

    console.log("before: ", reminder_time);

    const [newMedication] = await db("medications").insert({
      user_id,
      medication_name,
      reminder_time: reminder_time,
    });

    return NextResponse.json(newMedication, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create medication" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, user_id, medication_name, reminder_time } = await req.json();

    // Convert reminder_time to UTC using Moment.js
    const reminderTimeUtc = moment(reminder_time)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss");

    const [updatedMedication] = await db("medications")
      .where({ id })
      .update({ user_id, medication_name, reminder_time: reminderTimeUtc })
      .returning("*");

    if (updatedMedication) {
      return NextResponse.json(updatedMedication, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Medication not found" },
        { status: 404 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update medication" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const deletedCount = await db("medications").where({ id }).del();

    if (deletedCount > 0) {
      return NextResponse.json(
        { message: "Medication deleted successfully" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { message: "Medication not found" },
        { status: 404 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete medication" },
      { status: 500 },
    );
  }
}
