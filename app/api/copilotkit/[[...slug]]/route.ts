import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
  BuiltInAgent,
} from "@copilotkit/runtime/v2";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      // gemini-2.5-flash-lite: ~40% faster TTFT than 2.5-flash, same AG-UI
      // tool-call story, no Gemini-3.x thought_signature requirement.
      model: google("gemini-2.5-flash-lite"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt: SYSTEM_PROMPT,
      // Voice → single response from Gemini that emits all tool calls at
      // once (frontend handlers don't return data the model needs to "see").
      // No internal roundtrip needed. Keeps each utterance to one model call.
      maxSteps: 1,
      // Lower temp = faster decoding + more deterministic tool selection.
      temperature: 0,
    }),
  },
  runner: new InMemoryAgentRunner(),
});

// single-route: all requests go to POST /api/copilotkit with { method, params, body } envelope.
// Omitting GET so the frontend's auto-detect falls back to single-route mode.
export const POST = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
  mode: "single-route",
});
