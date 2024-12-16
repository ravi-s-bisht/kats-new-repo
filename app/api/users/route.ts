import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import db from "../db/connection";

export async function GET(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    const admin_id = new URL(req.url).searchParams.get("admin_id");

    // Extract branch_id from the admin
    const admin = await db("users")
      .where({ id: admin_id, role: "admin" })
      .first();

    // If no id is provided, fetch all users
    const query = db("users")
      .where({ branch_id: admin.branch_id, role: "user" })
      .leftJoin("medications", "users.id", "medications.user_id")
      .select(
        "users.*",
        "medications.id as medication_id",
        "medications.medication_name",
        "medications.reminder_time",
        "medications.executed_datetime"
      )
      .orderBy("users.first_name");

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
          email: row.email,
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
    return NextResponse.json(
      { message: "Failed to fetch user(s)" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { first_name, last_name, phone_number, email, admin_id } =
      await req.json();

    const admin = await db("users")
      .where({ id: admin_id, role: "admin" })
      .first();

    // Check if the phone number already exists
    const existingUser = await db("users")
      .where({ phone_number, role: "user" })
      .first();
    const existingEmail = await db("users")
      .where({ email, role: "user" })
      .first();

    if (existingUser) {
      return NextResponse.json(
        { message: "Phone number already exists" },
        { status: 400 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    const [newUser] = await db("users")
      .insert({
        first_name,
        last_name,
        phone_number,
        email,
        role: "user",
        branch_id: admin.branch_id,
      })
      .returning("*");

    const transporter = nodemailer.createTransport({
      service: "Gmail", // Use Gmail or any other service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your app password
      },
    });

    // const LOGIN_URL = "http://localhost:3000/login";
    const LOGIN_URL = "https://vercel-temp-dep.vercel.app/login"
    await transporter.sendMail({
      from: `"AvatarX Team" <pg@avatarx.live>`, // Sender details
      to: email, // Recipient email address
      subject: "Welcome to AvatarX!",
      html: `
            <p>Hi ${first_name},</p>
            <p>You've been added to <strong>AvatarX</strong>, your AI companion platform! 🎉</p>
            <p>To get started, log in using your registered email address at the following link:</p>
            <p><a href="${LOGIN_URL}" target="_blank">${LOGIN_URL}</a></p>
            <p>If you have any questions or need assistance, feel free to reach out to your facility administrator.</p>
            <br>
            <p>Welcome aboard!</p>
            <p><strong>The AvatarX Team</strong></p>
            <hr>
            <p style="font-size: 12px; color: gray;">This email may contain sensitive information. If you are not the intended recipient, please delete it immediately.</p>
        `,
    });
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
    const { id, first_name, last_name, phone_number, email } = await req.json();

    // check if email or phone number already exists other than the user being updated
    const existingUser = await db("users")
      .where({ phone_number, role: "user" })
      .whereNot({ id })
      .first();

    const existingEmail = await db("users")
      .where({ email, role: "user" })
      .whereNot({ id })
      .first();

    if (existingUser) {
      return NextResponse.json(
        { message: "Phone number already exists" },
        { status: 400 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    // Perform the update
    const rowsAffected = await db("users")
      .where({ id, role: "user" })
      .update({ first_name, last_name, phone_number, email });

    if (rowsAffected) {
      // Fetch the updated user
      const updatedUser = await db("users").where({ id }).first();
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
      await trx("users").where({ id, role: "user" }).del();
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
