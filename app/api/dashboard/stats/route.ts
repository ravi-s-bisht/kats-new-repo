import { NextResponse } from "next/server";
import db from "../../db/connection";

const knex = db;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "all";
    const adminId = searchParams.get("admin_id");

    if (!adminId) {
      return NextResponse.json({ error: "Missing admin_id parameter" }, { status: 400 });
    }

    const admin = await knex("users").where({ role: "admin", id: adminId }).first();

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const { branch_id } = admin;

    let startDate: Date | null = null;
    const endDate = new Date();

    switch (timeRange) {
      case "1d":
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "custom":
        const customStart = searchParams.get("startDate");
        const customEnd = searchParams.get("endDate");
        if (customStart && customEnd) {
          startDate = new Date(customStart);
          endDate.setTime(Date.parse(customEnd));
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({ error: "Invalid custom date range" }, { status: 400 });
          }
        } else {
          return NextResponse.json({ error: "Missing custom date range parameters" }, { status: 400 });
        }
        break;
      default:
        // 'all' time, no start date filter
        break;
    }

    // Fetch user count
    const userQuery = knex("users")
      .count("* as count")
      .where({ role: "user", branch_id });
    if (startDate) {
      userQuery
        .where("created_at", ">=", startDate)
        .andWhere("created_at", "<=", endDate);
    }
    const [{ count: userCount }] = await userQuery;

    // Fetch video and audio conversation counts
    const sessionQuery = knex("sessionlog")
      .select("sessionlog.type")
      .count("* as count")
      .groupBy("sessionlog.type")
      .join("users", "sessionlog.user_id", "users.id")
      .where("users.branch_id", branch_id);

    if (startDate) {
      sessionQuery
        .where("sessionlog.created_at", ">=", startDate)
        .andWhere("sessionlog.created_at", "<=", endDate);
    }

    const sessionCounts = await sessionQuery;

    const videoCount =
      sessionCounts.find((s) => s.type === "video")?.count || 0;
    const audioCount =
      sessionCounts.find((s) => s.type === "voice")?.count || 0;

    // Fetch total reminders count
    const reminderQuery = knex("reminderhistory")
      .count("* as count")
      .join("medications", "reminderhistory.medication_id", "medications.id")
      .join("users", "medications.user_id", "users.id")
      .where("users.branch_id", branch_id);
    if (startDate) {
      reminderQuery
        .where("reminderhistory.reminder_time", ">=", startDate)
        .andWhere("reminderhistory.reminder_time", "<=", endDate);
    }
    const [{ count: reminderCount }] = await reminderQuery;

    // Fetch reminder history
    const reminderHistoryQuery = knex("reminderhistory")
      .join("medications", "reminderhistory.medication_id", "medications.id")
      .join("users", "medications.user_id", "users.id")
      .select(
        "reminderhistory.id",
        knex.raw('CONCAT(users.first_name, " ", users.last_name) as full_name'),
        "medications.medication_name as medicine",
        "medications.reminder_time as time_set",
        "reminderhistory.reminder_time as reminded_at"
      )
      .where("users.branch_id", branch_id)
      .orderBy("reminderhistory.reminder_time", "desc")
      .limit(10);

    if (startDate) {
      reminderHistoryQuery
        .where("reminderhistory.reminder_time", ">=", startDate)
        .andWhere("reminderhistory.reminder_time", "<=", endDate);
    }

    const reminderHistory = await reminderHistoryQuery;

    return NextResponse.json({
      stats: {
        users: userCount,
        videoConversations: videoCount,
        audioConversations: audioCount,
        reminders: reminderCount,
      },
      reminderHistory,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);

    const errorMessage = "Internal Server Error";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
