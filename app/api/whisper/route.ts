import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { OPENAI_KEY } from "@/lib/runtime-config";

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

    // OPENAI_KEY is injected at build time by amplify.yml
    const apiKey = OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Whisper] No OpenAI API key configured");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    console.log("[Whisper] Processing audio:", {
      size: audioFile.size,
      type: audioFile.type,
      hasKey: !!apiKey,
    });

    const openai = new OpenAI({ apiKey });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
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
