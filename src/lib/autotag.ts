import Anthropic from "@anthropic-ai/sdk";

const COLLEGE_VOCAB = [
  "people", "outdoor", "indoor", "crowd", "stage", "ceremony",
  "award", "classroom", "lab", "sports", "field", "court",
  "cultural", "music", "dance", "hackathon", "fest",
  "graduation", "campus", "students", "faculty", "equipment",
  "presentation", "competition", "workshop", "seminar", "banner",
];

// Returns [] silently on any failure — upload must never be blocked by tagging.
export async function autoTag(
  imageUrl: string,
  resourceType: "image" | "video",
  category: string,
): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY) return [];

  try {
    const client = new Anthropic();
    const subject = resourceType === "video" ? "video thumbnail" : "photo";

    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 128,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: imageUrl } },
            {
              type: "text",
              text: `This is a college ${subject} from the "${category}" category.\n` +
                `Pick 4–6 tags from: ${COLLEGE_VOCAB.join(", ")}.\n` +
                `Add up to 2 custom tags if clearly visible in the image.\n` +
                `Reply with ONLY a comma-separated list, lowercase. Example: outdoor, crowd, award`,
            },
          ],
        },
      ],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
    return raw
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
      .filter((t) => t.length > 1 && t.length < 32)
      .slice(0, 8);
  } catch {
    return [];
  }
}
