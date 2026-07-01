"use client";

import { SubmitEvent, useState } from "react";
import Link from "next/link";
import { List, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "radix-ui";

type MinuteCommentsProps = {
  minuteId: string;
  commentCount: number;
};

export default function MinuteComments({ minuteId, commentCount }: MinuteCommentsProps) {
  const [currentCommentCount, setCurrentCommentCount] = useState(commentCount);
  const [comment, setComment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const trimmedComment = comment.trim();
  const canSubmit = trimmedComment.length > 0 && !isSaving;

  async function addComment(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/minutes/${minuteId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          comment: trimmedComment
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      await response.json();
      setCurrentCommentCount((count) => count + 1);
      setComment("");
      setIsDialogOpen(false);
    } catch {
      setError("コメントを保存できませんでした。もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-800"
      >
        <MessageCircle size={17} aria-hidden="true" />
        コメントを書く
      </button>

      <Link
        href="/comments"
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-800"
      >
        <List size={17} aria-hidden="true" />
        コメント一覧を見る
        <span className="rounded bg-white px-1.5 py-0.5 text-xs tabular-nums text-gray-500 ring-1 ring-gray-200">
          {currentCommentCount}
        </span>
      </Link>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AnimatePresence>
          {isDialogOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="fixed inset-0 z-40 bg-black/40"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 6 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-40px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-xl outline-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Dialog.Title className="text-lg font-semibold leading-7 text-gray-900">
                        コメントを書く
                      </Dialog.Title>
                      <Dialog.Description className="mt-1 text-sm leading-6 text-gray-600">
                        この決まったことにコメントを残します。
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="閉じる"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <form onSubmit={addComment} className="mt-4 space-y-4">
                    <label className="block">
                      <span className="sr-only">コメント</span>
                      <textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        rows={6}
                        maxLength={1000}
                        placeholder="コメントを書いてください"
                        className="block w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-3 text-base leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </label>

                    {error && <p className="text-sm leading-6 text-red-600">{error}</p>}

                    <div className="flex justify-end gap-2">
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="min-h-11 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          やめる
                        </button>
                      </Dialog.Close>
                      <motion.button
                        type="submit"
                        disabled={!canSubmit}
                        whileTap={canSubmit ? { scale: 0.97 } : undefined}
                        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-green-700 px-4 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        <Send size={18} aria-hidden="true" />
                        {isSaving ? "保存中" : "保存する"}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </div>
  );
}
