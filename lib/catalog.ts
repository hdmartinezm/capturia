import { z } from "zod";

// A2UI catalog: Zod schemas define the contract between the agent and the UI.
// These schemas are injected into the agent's system prompt via useCopilotAction.

export const overlayPositionSchema = z.enum([
  "top-left",
  "top-right",
  "top-center",
  "center-left",
  "center-right",
  "bottom-left",
  "bottom-right",
  "bottom-center",
  "full-bottom",
]);

export const catalogDefinitions = {
  MetricsPanel: {
    description:
      "A dark card with a title and 2-4 metric rows (label, value, optional delta). Good for KPIs, stats.",
    props: z.object({
      title: z.string().describe("Panel heading"),
      metrics: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          delta: z.string().optional().describe("e.g. '+12%' or '-3'"),
        })
      ).describe("2 to 4 metric rows"),
    }),
  },
  Timeline: {
    description:
      "Horizontal stepper with N labeled steps, current step highlighted. Good for tutorials, processes.",
    props: z.object({
      steps: z.array(z.object({ label: z.string() })),
      currentStep: z.number().describe("0-indexed active step"),
    }),
  },
  LowerThird: {
    description:
      "Broadcast-style name + subtitle bar. Classic TV lower-third. Use position bottom-left or full-bottom.",
    props: z.object({
      name: z.string().describe("Primary name / title"),
      subtitle: z.string().describe("Role, company, or context"),
    }),
  },
  ProgressBar: {
    description:
      "Full-width progress bar with optional label. Good for loading, completion status. Set `indeterminate: true` for an animated stripe (e.g. 'thinking', 'loading…') without a known percentage.",
    props: z.object({
      progress: z.number().min(0).max(100).describe("0-100"),
      label: z.string().optional(),
      indeterminate: z.boolean().optional(),
    }),
  },
  KeywordHighlight: {
    description:
      "Floating glowing word chips. Good for emphasizing terms, hashtags, buzzwords.",
    props: z.object({
      keywords: z.array(z.string()).describe("Words to highlight"),
      color: z.string().describe("CSS color, e.g. '#22c55e' or 'cyan'"),
    }),
  },
  FloatingChart: {
    description: "Compact sparkline or bar chart in a small card. Good for trends, time series.",
    props: z.object({
      data: z.array(z.number()).describe("Array of numeric values"),
      chartType: z.enum(["line", "bar"]),
      label: z.string(),
    }),
  },
  ChatBubble: {
    description: "A speech bubble with text and optional author name.",
    props: z.object({
      text: z.string(),
      author: z.string().optional(),
    }),
  },
  Letterbox: {
    description:
      "Full-screen black bars top and bottom for cinematic 2.35:1 feel. No position needed.",
    props: z.object({
      enabled: z.boolean(),
    }),
  },
  Ticker: {
    description:
      "Horizontal scrolling text band, classic cable-news lower-third look. Best at full-bottom or top-center across the full width. Items loop seamlessly.",
    props: z.object({
      items: z.array(z.string()).describe("Short headlines or messages"),
      accent: z.string().optional().describe("CSS color for bullet dots, e.g. '#ef4444'"),
    }),
  },
  LiveBadge: {
    description:
      "Pulsing colored 'LIVE' pill. Use to mark a stream as live or call attention to anything happening right now. Tiny, sits in a corner.",
    props: z.object({
      label: z.string().optional().describe("Defaults to 'LIVE'. Keep ≤6 chars."),
      color: z.string().optional().describe("CSS color, defaults to red"),
    }),
  },
  StatRing: {
    description:
      "Radial donut progress ring with center percentage and a side label. Great for completion, capacity, score-out-of-100.",
    props: z.object({
      value: z.number().min(0).max(100).describe("0-100"),
      label: z.string(),
      color: z.string().optional().describe("CSS color, defaults to cyan"),
      size: z.number().optional().describe("Pixel size, defaults to 84"),
    }),
  },
  BigCounter: {
    description:
      "Huge animated number with a small label above. Counts up smoothly. Great for live viewers, sales, score, anything dramatic.",
    props: z.object({
      value: z.number(),
      label: z.string().describe("Tiny label above, e.g. 'VIEWERS'"),
      prefix: z.string().optional().describe("e.g. '$'"),
      suffix: z.string().optional().describe("e.g. ' watching'"),
      color: z.string().optional(),
    }),
  },
} as const;

export type CatalogKey = keyof typeof catalogDefinitions;
