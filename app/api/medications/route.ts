import { NextResponse } from "next/server";
import db from "../db/connection";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET() {
  try {
    const medications = await db("medications").select("*");
    return NextResponse.json(medications, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch medications" },
      { status: 500 }
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
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, user_id, medication_name, reminder_time } = await req.json();

    const now = dayjs().tz("America/Los_Angeles");

    const query = db("medications")
      .where({ id, user_id })
      .update({ user_id, medication_name, reminder_time: reminder_time });

      const todayDate = dayjs().tz('America/Los_Angeles').format('YYYY-MM-DD');
      const fullReminderTime = `${todayDate}T${reminder_time}`;
      const reminderTime = dayjs(fullReminderTime);

    console.log('reminder_time: ', reminderTime, now);

    if (dayjs(reminderTime).isBefore(now)) {
      query.update({ executed_datetime: null });
    }

    const rowsAffected = await query;

    if (rowsAffected) {
      const updatedMedication = await db("medications").where({ id }).first();
      return NextResponse.json(updatedMedication, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Medication not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update medication" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { medication_id, user_id } = await req.json();

    const deletedCount = await db("medications")
      .where({ id: medication_id, user_id })
      .del();

    if (deletedCount > 0) {
      return NextResponse.json(
        { message: "Medication deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Medication not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete medication" },
      { status: 500 }
    );
  }
}