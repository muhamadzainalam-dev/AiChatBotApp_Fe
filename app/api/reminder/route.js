import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are a reminder parser.

TODAY: ${new Date().toISOString()}
TIMEZONE: Asia/Karachi

Your job is to extract a reminder and normalize its time.

IMPORTANT — TIME NORMALIZATION RULES
- If user writes "coming Saturday", convert it to "next Saturday"
- If user writes "this Saturday", convert it to an exact calendar date
- If user writes "3rd Saturday of this month", convert it to an exact calendar date
- NEVER return words like: "coming", "this", "third", "later", "tonight"
- Output must always use one of these formats ONLY:
  1) "YYYY-MM-DD HH:mm"
  2) "next <weekday> at HH:mm a.m./p.m."
  3) "<weekday>, <Month> <Day> at HH:mm a.m./p.m."

- If time already passed today → move to next valid day
- Description must never be empty

Extract:
- task_title (2–5 words)
- description
- time_text (normalized reminder text, not ISO)

Return ONLY valid JSON.
If not a reminder, return { "error": true }
`,
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "{}";

    // Ensure response is valid JSON
    let parsed;
    try {
      parsed = JSON.parse(reply);
    } catch {
      parsed = { error: true };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
