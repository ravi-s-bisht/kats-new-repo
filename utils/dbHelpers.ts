import db from "@/app/api/db/connection";

// utils/dbHelpers.ts
export async function checkUserInDatabase(
  email: string,
  role: string
): Promise<boolean> {
  const user = await db("users").where({ email, role }).first();
  return !!user;
}

export async function registerNewAdmin(
  email: string,
  userInfo: any,
  company: string
): Promise<void> {
  const facility = await db("facility").where({ name: company }).first();
  if (!facility) {
    const [newFacility] = await db("facility")
      .insert({ name: company })
      .returning("id");
    const [newBranch] = await db("branch")
      .insert({
        location: null,
        facility_id: newFacility,
      })
      .returning("id");
    await db("users").insert({
      email,
      role: "admin",
      first_name: userInfo.data.given_name,
      last_name: userInfo.data.family_name,
      branch_id: newBranch,
    });
  } else {
    const [newBranch] = await db("branch")
      .insert({
        location: null,
        facility_id: facility.id,
      })
      .returning("id");
    await db("users").insert({
      email,
      role: "admin",
      first_name: userInfo.data.given_name,
      last_name: userInfo.data.family_name,
      branch_id: newBranch,
    });
  }
}
