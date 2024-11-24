import { NextResponse } from "next/server";
import db from "../db/connection";
import moment from "moment";

export async function GET(req: Request) {
  console.log('req: ', req);
  try {
    const id = new URL(req.url).searchParams.get("id");

    // If no id is provided, fetch all users
    const query = db("users")
      .leftJoin("medications", "users.id", "medications.user_id")
      .select(
        "users.*",
        "medications.id as medication_id",
        "medications.medication_name",
        "medications.reminder_time",
        "medications.executed_datetime"
      );

    if (id) {
      query.where("users.id", id); // Filter by user ID if provided
    }

    const results = await query;

    // Group the medications into an array for each user
    const users = results.reduce((acc, row) => {
      let user = acc.find((u: any) => u.id === row.id);
      if (!user) {
        user = {
          id: row.id,
          first_name: row.first_name,
          last_name: row.last_name,
          phone_number: row.phone_number,
          created_at: row.created_at,
          updated_at: row.updated_at,
          medications: [], // Initialize the medications array
        };
        acc.push(user);
      }

      // Add medication details to the medications array if medication exists
      if (row.medication_id) {
        user.medications.push({
          id: row.medication_id,
          medication_name: row.medication_name,
          reminder_time: row.reminder_time,
          executed_datetime: row.executed_datetime,
        });
      }

      return acc;
    }, []);

    // Check if medications is defined and clean up if necessary
    users.forEach((user: any) => {
      if (!user.medications || user.medications[0] === null) {
        user.medications = [];
      }
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.log('ERRORRRR: ', error);
    return NextResponse.json(
      { message: "Failed to fetch user(s)" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { first_name, last_name, phone_number } = await req.json();

    // Check if the phone number already exists
    const existingUser = await db("users").where({ phone_number }).first();

    if (existingUser) {
      return NextResponse.json(
        { message: "Phone number already exists" },
        { status: 400 }
      );
    }

    const [newUser] = await db("users")
      .insert({ first_name, last_name, phone_number })
      .returning("*");
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, first_name, last_name, phone_number } = await req.json();
    const [updatedUser] = await db("users")
      .where({ id })
      .update({ first_name, last_name, phone_number })
      .returning("*");

    if (updatedUser) {
      return NextResponse.json(updatedUser, { status: 200 });
    } else {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    
    // Start a transaction to ensure both operations complete or none do
    await db.transaction(async (trx) => {
      // Delete related medications first
      await trx("medications").where({ user_id: id }).del();
      // Then delete the user
      await trx("users").where({ id }).del();
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
