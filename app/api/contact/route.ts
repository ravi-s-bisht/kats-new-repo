import nodemailer from 'nodemailer';

export async function POST(req) {
  const body = await req.json(); // Parse JSON request body

  const { name, email, subject, message } = body;

  // Basic validation
  if (!name || !email || !subject || !message) {
    return new Response(
      JSON.stringify({ error: 'All fields are required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Nodemailer configuration
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use Gmail or any other service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your app password
    },
  });

  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`, // Sender details
      to: process.env.EMAIL_TO, // Recipient email address
      subject: subject,
      text: `Email: ${email} \n\n${message}`,
    });

    return new Response(
      JSON.stringify({ message: 'Email sent successfully!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}