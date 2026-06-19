import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GROQ_KEY } from "@/lib/runtime-config";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // GROQ_KEY is injected at build time by amplify.yml
    const apiKey = GROQ_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("[Whisper] No Groq API key configured");
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    console.log("[Whisper] Processing audio with Groq:", {
      size: audioFile.size,
      type: audioFile.type,
      hasKey: !!apiKey,
    });

    // Use Groq's OpenAI-compatible API
    const groq = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3", // Groq's Whisper model
      language: "es", // Spanish
      response_format: "text",
    });

    console.log("[Whisper] Transcription:", transcription);

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("[Whisper] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
