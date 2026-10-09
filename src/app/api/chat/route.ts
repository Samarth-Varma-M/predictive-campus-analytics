import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { student, query, chatHistory } = await req.json();

    // Load the API key from the environment variable for security
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ reply: "API Key not configured." }, { status: 500 });
    }
    
    const systemInstruction = `You are the 'Campus AI Counselor' for KPMG Smart Campus Analytics.
You are helping a college administrator intervene with a student named ${student.name}.
Student Data:
- Tier: ${student.tier}
- CGPA: ${student.cgpa.toFixed(2)}
- Attendance: ${student.attendancePct.toFixed(1)}%
- Composite Score: ${student.compositeSuccessScore.toFixed(1)}/100
- Top Strength: ${student.positiveDrivers[0]?.feature || 'None'}
- Biggest Risk Factor: ${student.negativeDrivers[0]?.feature || 'None'}
- Recommended Action: ${student.recommendedInterventions[0]}

Keep your answers concise, professional, and directly actionable (max 2-3 sentences). If asked to draft an email, write a short, empathetic email to the student addressing their risk factor. Do not use markdown bolding excessively.`;

    const contents = [];
    
    // Convert history format to Gemini format
    for (const msg of chatHistory) {
      contents.push({
        role: msg.role === "system" ? "model" : "user",
        parts: [{ text: msg.text }]
      });
    }

    // Add current query
    contents.push({
        role: "user",
        parts: [{ text: query }]
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("Gemini API Error:", data);
        // Fallback for hackathon demo if key is invalid/expired
        return NextResponse.json({ reply: "I'm sorry, I couldn't connect to the AI model right now (Invalid API Key). But based on their profile, I strongly recommend focusing on their " + (student.negativeDrivers[0]?.feature?.toLowerCase() || 'attendance') + "." });
    }

    const reply = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ reply: "I'm sorry, an internal error occurred." }, { status: 500 });
  }
}
