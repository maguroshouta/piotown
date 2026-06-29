"use client";

import { useMemo, useState } from "react";

type MinuteReaction = {
  id: string;
  reaction: ReactionEmoji;
};

type MinuteReactionsProps = {
  minuteId: string;
  reactions: MinuteReaction[];
};

type ReactionEmoji = (typeof reactionOptions)[number];

const reactionOptions = ["👍", "🎉", "❤️", "👀"] as const;

export default function MinuteReactions({ minuteId, reactions }: MinuteReactionsProps) {
  const [currentReactions, setCurrentReactions] = useState(reactions);
  const [pendingReaction, setPendingReaction] = useState<ReactionEmoji | null>(null);
  const [hasError, setHasError] = useState(false);

  const reactionCounts = useMemo(() => {
    return currentReactions.reduce<Record<ReactionEmoji, number>>(
      (counts, reaction) => {
        counts[reaction.reaction] += 1;
        return counts;
      },
      {
        "👍": 0,
        "🎉": 0,
        "❤️": 0,
        "👀": 0
      }
    );
  }, [currentReactions]);

  async function addReaction(reaction: ReactionEmoji) {
    if (pendingReaction) {
      return;
    }

    setPendingReaction(reaction);
    setHasError(false);

    try {
      const response = await fetch(`/api/minutes/${minuteId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reaction })
      });

      if (!response.ok) {
        throw new Error("Failed to add reaction");
      }

      const minuteReaction = (await response.json()) as MinuteReaction;
      setCurrentReactions((items) => [...items, minuteReaction]);
    } catch {
      setHasError(true);
    } finally {
      setPendingReaction(null);
    }
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-3">
      <div className="flex flex-wrap gap-2">
        {reactionOptions.map((reaction) => (
          <button
            key={reaction}
            type="button"
            onClick={() => addReaction(reaction)}
            disabled={pendingReaction !== null}
            aria-label={`${reaction} のリアクション`}
            className="inline-flex min-h-10 min-w-14 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="emoji-font text-xl leading-none" aria-hidden="true">
              {reaction}
            </span>
            <span className="tabular-nums">{reactionCounts[reaction]}</span>
          </button>
        ))}
      </div>
      {hasError && (
        <p className="mt-2 text-sm leading-6 text-red-600">
          リアクションを追加できませんでした。
        </p>
      )}
    </div>
  );
}
