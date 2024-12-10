import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../db/connection';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  const body = await req.json();
  const { token } = body;

  try {
    const userInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const email = userInfo.data.email as string;

    console.log('em: ', email)

    const emailUser = await db('users').where({ email }).first();

    console.log('emailUser: ', emailUser)

    if (emailUser) {
      const jwtToken = jwt.sign({ email, role: emailUser.role }, JWT_SECRET, { expiresIn: '1h' });
      return NextResponse.json({ token: jwtToken, role: emailUser.role, user: emailUser });
    }

    // Check the email domain
    const isPersonalEmail = ['gmail.com', 'yahoo.com', 'hotmail.com'].some(domain => email.endsWith(domain));

    let role: 'user' | 'admin';
    if (isPersonalEmail) {
      // Check if the user exists in the database (mock implementation)
      const userExists = await checkUserInDatabase(email, 'user');
      if (!userExists) {
        // Return response with error message
        return NextResponse.json({ error: 'User not registered!' }, { status: 401 });
      }
      role = 'user';
    } else {
      // Check if the email is in the admin table (mock implementation)
      const adminExists = await checkUserInDatabase(email, 'admin');
      if (!adminExists) {
        // Register as a new admin (mock implementation)
        const company = email.split('@')[1].split('.')[0];
        await registerNewAdmin(email, userInfo, company);
      }
      role = 'admin';
    }

    const user = await db('users').where({ email, role }).first();

    // Create a JWT token
    const jwtToken = jwt.sign({ email, role }, JWT_SECRET, { expiresIn: '1h' });

    return NextResponse.json({ token: jwtToken, role, user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

// Mock implementations of database checks
async function checkUserInDatabase(email: string, role: string): Promise<boolean> {
  // write knex query where email = email and role = role
  const user = await db('users').where({ email, role }).first();

  return user;
}

async function registerNewAdmin(email: string, userInfo: any, company: string): Promise<void> {  
  // write knex query to insert into facility table
  const facility = await db('facility').where({ name: company }).first();
  if (!facility) {
    await db('facility').insert({ name: company });
    const newFacility = await db('facility').insert({ name: company });
    const newBranch = await db('branch').insert({ location: null, facility_id: newFacility[0] });
    const newAdmin = await db('users').insert({ email, role: 'admin', first_name: userInfo.data.given_name, last_name: userInfo.data.family_name, branch_id: newBranch[0] });
  } else {
    const newBranch = await db('branch').insert({ location: null, facility_id: facility.id });
    const newAdmin = await db('users').insert({ email, role: 'admin', first_name: userInfo.data.given_name, last_name: userInfo.data.family_name, branch_id: newBranch[0] });
  }
}