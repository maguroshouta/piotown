import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Context } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";

const app = new Hono().basePath("/api");

const validationErrorResponse: Parameters<typeof zValidator>[2] = (result, c) => {
  if (!result.success) {
    return c.json({ message: "Invalid request", errors: result.error.issues }, 400);
  }
};

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

const minuteReactionSchema = z.object({
  reaction: z.enum(["👍", "🎉", "❤️", "👀"])
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
  kind: z.enum(["trouble", "idea", "TROUBLE", "IDEA"]).transform((kind) => {
    return kind === "idea" || kind === "IDEA" ? "IDEA" : "TROUBLE";
  }),
  content: z.string().trim().min(1)
});

function getClientIp(c: Context) {
  const forwardedFor = c.req.header("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }

  return (
    c.req.header("x-real-ip") ??
    c.req.header("cf-connecting-ip") ??
    c.req.header("fastly-client-ip") ??
    ""
  );
}

app.get("/minutes", async (c) => {
  const minutes = await prisma.minute.findMany({
    include: {
      items: true,
      minuteReactions: true,
      minuteComments: true
    },
    orderBy: {
      date: "desc"
    }
  });
  return c.json(minutes);
});

app.post("/minutes", zValidator("json", createMinuteSchema, validationErrorResponse), async (c) => {
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
  zValidator("param", idParamSchema, validationErrorResponse),
  zValidator("json", minuteReactionSchema, validationErrorResponse),
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
  zValidator("param", idParamSchema, validationErrorResponse),
  zValidator("json", minuteCommentSchema, validationErrorResponse),
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
  zValidator("param", idParamSchema, validationErrorResponse),
  zValidator("json", updateMinuteSchema, validationErrorResponse),
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

app.post("/seeds", zValidator("json", createSeedSchema, validationErrorResponse), async (c) => {
  const data = c.req.valid("json");
  const ipAddress = getClientIp(c);

  if (!ipAddress) {
    return c.json({ message: "Unable to identify client IP address" }, 400);
  }

  const seed = await prisma.seed.create({
    data: {
      kind: data.kind,
      content: data.content,
      ipAddress
    }
  });

  return c.json(seed);
});

app.delete("/seeds/:id", zValidator("param", idParamSchema, validationErrorResponse), async (c) => {
  const { id } = c.req.valid("param");
  const ipAddress = getClientIp(c);

  if (!ipAddress) {
    return c.json({ message: "Unable to identify client IP address" }, 400);
  }

  const seed = await prisma.seed.findUnique({
    where: { id },
    select: { ipAddress: true }
  });

  if (!seed) {
    return c.json({ message: "Seed not found" }, 404);
  }

  if (seed.ipAddress !== ipAddress) {
    return c.json({ message: "You can only delete seeds created from the same IP address" }, 403);
  }

  await prisma.seed.delete({
    where: { id }
  });

  return c.json({ id });
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
