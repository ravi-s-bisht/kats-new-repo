import { fetchAccessToken } from "hume";

export async function POST() {
  console.log("POST /api/hume:");
  try {
    const accessToken = await fetchAccessToken({
      apiKey: String(process.env.NEXT_PUBLIC_HUME_API_KEY),
      secretKey: String(process.env.NEXT_PUBLIC_HUME_CLIENT_SECRET),
    });

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Unable to retrieve access token" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ accessToken }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error APIIII", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
