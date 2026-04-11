import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const GROK_MODEL = process.env.GROK_MODEL ?? "llama-3.3-70b-versatile";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function buildSystemPrompt(
  about: { content: string; heroTagline?: string | null; contactCaption?: string | null } | null,
  portfolio: { title: string; description: string; link?: string | null }[],
  skillCategories: { title: string; items: { label: string }[] }[],
  social: {
    github?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
    twitter?: string | null;
  } | null
): string {
  const name = siteConfig.heroName;
  const title = siteConfig.heroTitle;
  const email = siteConfig.contactEmail;

  const sections: string[] = [];

  sections.push(
    `You are an AI assistant on ${name}'s portfolio website. Your role is to help visitors learn about ${name} and connect with them if interested.`
  );

  // About
  const tagline = about?.heroTagline?.trim();
  const bio = about?.content?.trim();
  const caption = about?.contactCaption?.trim();
  if (tagline || bio || caption) {
    sections.push(`== ABOUT ${name.toUpperCase()} ==`);
    if (tagline) sections.push(`Tagline: ${tagline}`);
    if (bio) sections.push(bio);
    if (caption) sections.push(`Contact note: ${caption}`);
  }

  // Projects
  if (portfolio.length > 0) {
    sections.push(`== PROJECTS ==`);
    portfolio.forEach((p, i) => {
      const link = p.link ? ` — ${p.link}` : "";
      sections.push(`${i + 1}. ${p.title}${link}\n   ${p.description}`);
    });
  }

  // Skills
  if (skillCategories.length > 0) {
    sections.push(`== SKILLS ==`);
    skillCategories.forEach((cat) => {
      const items = cat.items.map((it) => it.label).join(", ");
      sections.push(`${cat.title}: ${items}`);
    });
  }

  // Contact & social
  const contactLines: string[] = [];
  if (email) contactLines.push(`Email: ${email}`);
  if (social?.github) contactLines.push(`GitHub: ${social.github}`);
  if (social?.linkedin) contactLines.push(`LinkedIn: ${social.linkedin}`);
  if (social?.twitter) contactLines.push(`Twitter/X: ${social.twitter}`);
  if (social?.instagram) contactLines.push(`Instagram: ${social.instagram}`);
  if (contactLines.length > 0) {
    sections.push(`== CONTACT & SOCIAL ==\n${contactLines.join("\n")}`);
  }

  // Behaviour guidelines
  sections.push(`== GUIDELINES ==
- Respond concisely (2–4 sentences) unless more detail is explicitly asked for.
- Present ${name}'s work honestly and with quiet confidence. Highlight real strengths — never fabricate achievements.
- ${name} is a ${title} who cares deeply about the craft: clean code, thoughtful architecture, and real results. Convey that naturally.
- If a visitor seems interested in hiring or collaborating, warmly encourage them to get in touch.
- When someone wants to contact ${name}: collect their full name, their role/what they do, their email address, and their message — one step at a time, conversationally. Then confirm before submitting.
- Use the submit_contact_form tool once you have all four fields (name, role, email, message) confirmed by the user.
- After a successful submission, thank them and let them know ${name} will follow up soon.
- Keep the tone professional, warm, and approachable — this is the first impression you make on potential collaborators and employers.`);

  return sections.join("\n\n");
}

const submitContactTool: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "submit_contact_form",
    description:
      "Submit a contact message from the visitor. Call this only once all four fields are confirmed.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Visitor's full name" },
        role: {
          type: "string",
          description: "Visitor's role or what they do, e.g. 'Recruiter', 'Founder', 'Engineer'",
        },
        email: { type: "string", description: "Visitor's email address" },
        message: { type: "string", description: "The message they want to send" },
      },
      required: ["name", "role", "email", "message"],
    },
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0) {
      return Response.json({ error: "No messages provided." }, { status: 400 });
    }

    // Fetch portfolio data in parallel
    const [about, portfolio, skillCategories, social] = await Promise.all([
      prisma.about.findFirst().catch(() => null),
      prisma.portfolio
        .findMany({ orderBy: { createdAt: "desc" }, take: 20 })
        .catch(() => []),
      prisma.skillCategory
        .findMany({
          orderBy: { sortOrder: "asc" },
          include: { items: { orderBy: { sortOrder: "asc" } } },
        })
        .catch(() => []),
      prisma.social.findFirst().catch(() => null),
    ]);

    const systemContent = buildSystemPrompt(about, portfolio, skillCategories, social);
    const allMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemContent },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload: Record<string, string>) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        };

        try {
          // Streaming completion with tool support
          const completion = await openai.chat.completions.create({
            model: GROK_MODEL,
            messages: allMessages,
            tools: [submitContactTool],
            tool_choice: "auto",
            stream: true,
            max_tokens: 512,
          });

          let finishReason: string | null = null;
          let toolCallId = "";
          let toolCallName = "";
          let toolCallArgsRaw = "";
          const assistantChunks: string[] = [];

          for await (const chunk of completion) {
            const choice = chunk.choices[0];
            if (!choice) continue;

            // Stream text delta
            const text = choice.delta?.content ?? "";
            if (text) {
              assistantChunks.push(text);
              send({ text });
            }

            // Accumulate tool call deltas
            const tc = choice.delta?.tool_calls?.[0];
            if (tc) {
              if (tc.id) toolCallId = tc.id;
              if (tc.function?.name) toolCallName = tc.function.name;
              if (tc.function?.arguments) toolCallArgsRaw += tc.function.arguments;
            }

            if (choice.finish_reason) finishReason = choice.finish_reason;
          }

          // Handle tool call
          if (finishReason === "tool_calls" && toolCallName === "submit_contact_form") {
            let toolResult: string;
            try {
              const args = JSON.parse(toolCallArgsRaw) as {
                name: string;
                role: string;
                email: string;
                message: string;
              };

              await prisma.contact.create({
                data: {
                  name: args.name,
                  email: args.email,
                  role: args.role,
                  message: args.message,
                },
              });
              toolResult = "Contact form submitted successfully.";
            } catch {
              toolResult =
                "Failed to submit contact form due to a server error. Please ask the visitor to try again later.";
            }

            // Second streaming pass with tool result
            const followUp = await openai.chat.completions.create({
              model: GROK_MODEL,
              messages: [
                ...allMessages,
                {
                  role: "assistant",
                  content: assistantChunks.join("") || null,
                  tool_calls: [
                    {
                      id: toolCallId,
                      type: "function",
                      function: {
                        name: toolCallName,
                        arguments: toolCallArgsRaw,
                      },
                    },
                  ],
                },
                {
                  role: "tool",
                  tool_call_id: toolCallId,
                  content: toolResult,
                },
              ],
              stream: true,
              max_tokens: 256,
            });

            for await (const chunk of followUp) {
              const text = chunk.choices[0]?.delta?.content ?? "";
              if (text) send({ text });
            }
          }

          send({ done: "1" });
          controller.close();
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "An unexpected error occurred.";
          send({ error: msg });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}
