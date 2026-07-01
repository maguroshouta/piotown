import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!
});

const app = new Hono().basePath("/api");

const idParamSchema = z.object({
  id: z.uuid()
});

const dateSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid date"
  })
  .transform((value) => new Date(value));

const minuteItemSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1)
});

const minuteCommentSchema = z.object({
  comment: z.string().trim().min(1).max(1000)
});

const createMinuteSchema = z.object({
  title: z.string().trim().min(1),
  date: dateSchema,
  published: z.boolean().optional().default(false),
  items: z.array(minuteItemSchema).optional().default([])
});

const updateMinuteSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    date: dateSchema.optional(),
    published: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  });

const createSeedSchema = z.object({
  content: z.string().trim().min(1)
});

const minuteReactionSchema = z.object({
  reaction: z.enum(["👍", "👎", "🎉", "❤️", "👀"])
});

async function safetyCheck(content: string) {
  return await generateText({
    model: openrouter("google/gemini-2.5-flash-lite"),
    instructions: `あなたは、入力された文章を分析し、「極度の暴言の有無」と「文章内容に合ったタグ」を判定するAIです。

以下のルールに従って判定してください。

## 判定内容

1. 極度の暴言の検知

- 人格否定、差別的表現、脅迫、過度な侮辱、攻撃的な罵倒が含まれているかを判定してください。
- 軽い不満や批判、皮肉、強い口調だけでは「極度の暴言」と判定しないでください。
- 文脈を考慮し、冗談・引用・説明目的の文章であっても、攻撃性が強い場合はその旨を判定してください。

2. タグ付け

- 文章の内容に合ったタグを複数つけてください。
- タグは短く、分類しやすい日本語にしてください。
- タグは文章の特徴を表すものを3〜7個程度つけてください。

## 出力形式

必ず以下のJSON形式で出力してください。

{
"is_extreme_abuse": true または false,
"abuse_level": "なし" | "軽度" | "中度" | "重度" | "極度",
"tags": ["タグ1", "タグ2", "タグ3"],
"reason": "判定理由を簡潔に説明してください",
"detected_expressions": ["問題がある表現があればここに記載。なければ空配列"]
}

## 判定基準

- なし：暴言や攻撃性がない
- 軽度：少し強い言い方、不満、軽い悪口
- 中度：明確な侮辱や攻撃的な表現
- 重度：強い人格否定、執拗な攻撃、差別的・脅迫的な表現
- 極度：非常に強い暴言、深刻な差別、明確な脅迫、相手を著しく傷つける表現

## 注意点

- 文章全体の文脈を見て判断してください。
- 単語だけで機械的に判定せず、使われ方を考慮してください。
- 暴言が含まれていても、ニュース・教育・分析目的で引用されている場合は、その文脈を理由に含めてください。
- タグは文章の特徴を表すものを3〜7個程度つけてください。
- 出力はJSONのみとし、余計な説明は書かないでください。`,
    prompt: content,
    output: Output.object({
      schema: z.object({
        is_extreme_abuse: z.boolean(),
        abuse_level: z.enum(["なし", "軽度", "中度", "重度", "極度"]),
        tags: z.array(z.string()),
        reason: z.string(),
        detected_expressions: z.array(z.string())
      })
    })
  });
}

app.get("/minutes", async (c) => {
  const targetReactions = minuteReactionSchema.shape.reaction.options;

  const minutes = await prisma.minute.findMany({
    include: {
      items: true,
      _count: {
        select: {
          minuteComments: true
        }
      }
    },
    orderBy: {
      date: "desc"
    }
  });

  const minuteIds = minutes.map((minute) => minute.id);

  const reactionGroups = await prisma.minuteReaction.groupBy({
    by: ["minuteId", "reaction"],
    where: {
      minuteId: {
        in: minuteIds
      },
      reaction: {
        in: [...targetReactions]
      }
    },
    _count: {
      _all: true
    }
  });

  const reactionCountMap = new Map<string, Record<(typeof targetReactions)[number], number>>();

  for (const minute of minutes) {
    reactionCountMap.set(minute.id, {
      "👍": 0,
      "👎": 0,
      "🎉": 0,
      "❤️": 0,
      "👀": 0
    });
  }

  for (const group of reactionGroups) {
    const counts = reactionCountMap.get(group.minuteId);

    if (!counts) continue;

    counts[group.reaction as (typeof targetReactions)[number]] = group._count._all;
  }

  const result = minutes.map((minute) => ({
    ...minute,
    reactionCounts: reactionCountMap.get(minute.id)
  }));

  return c.json(result);
});

app.post("/minutes", zValidator("json", createMinuteSchema), async (c) => {
  const data = c.req.valid("json");
  const minute = await prisma.minute.create({
    data: {
      title: data.title,
      date: data.date,
      published: data.published,
      items: {
        create: data.items
      }
    },
    include: {
      items: true,
      minuteReactions: true,
      minuteComments: true
    }
  });

  return c.json(minute);
});

app.post(
  "/minutes/:id/reactions",
  zValidator("param", idParamSchema),
  zValidator("json", minuteReactionSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { reaction } = c.req.valid("json");

    const minute = await prisma.minute.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!minute) {
      return c.json({ message: "Minute not found" }, 404);
    }

    const minuteReaction = await prisma.minuteReaction.create({
      data: {
        minuteId: id,
        reaction
      }
    });

    return c.json(minuteReaction, 201);
  }
);

app.get("/comments", async (c) => {
  const comments = await prisma.minuteComments.findMany({
    include: {
      minute: {
        select: {
          id: true,
          title: true,
          date: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return c.json(comments);
});

app.post(
  "/minutes/:id/comments",
  zValidator("param", idParamSchema),
  zValidator("json", minuteCommentSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { comment } = c.req.valid("json");

    const minute = await prisma.minute.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!minute) {
      return c.json({ message: "Minute not found" }, 404);
    }

    const minuteComment = await prisma.minuteComments.create({
      data: {
        minuteId: id,
        comment
      }
    });

    return c.json(minuteComment, 201);
  }
);

app.put(
  "/minutes/:id",
  zValidator("param", idParamSchema),
  zValidator("json", updateMinuteSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    const minute = await prisma.minute.update({
      where: { id },
      data
    });

    return c.json(minute);
  }
);

app.get("/seeds", async (c) => {
  const seeds = await prisma.seed.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
  return c.json(seeds);
});

app.post("/seeds", zValidator("json", createSeedSchema), async (c) => {
  const data = c.req.valid("json");

  const checkResult = await safetyCheck(data.content);

  if (!checkResult.output) {
    return c.json({ message: "エラーが発生しました" }, 500);
  }

  if (checkResult.output.is_extreme_abuse) {
    return c.json(
      {
        message: "極度の暴言が含まれているため、投稿できませんでした。",
        abuse_level: checkResult.output.abuse_level,
        reason: checkResult.output.reason,
        detected_expressions: checkResult.output.detected_expressions
      },
      400
    );
  }

  if (checkResult.output.abuse_level !== "なし") {
    return c.json(
      {
        message: "暴言が含まれている可能性があるため、投稿できませんでした。",
        abuse_level: checkResult.output.abuse_level,
        reason: checkResult.output.reason,
        detected_expressions: checkResult.output.detected_expressions
      },
      400
    );
  }

  const seed = await prisma.seed.create({
    data: {
      tags: checkResult.output.tags.join(","),
      content: data.content
    }
  });

  return c.json(seed);
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
