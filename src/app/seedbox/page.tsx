"use client";

import { SubmitEvent, useEffect, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "radix-ui";

type SeedResponse = {
  id: string;
  tags: string;
  content: string;
  createdAt: string;
};

export default function SeedBox() {
  const [text, setText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState<SeedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSeeds() {
      try {
        const response = await fetch("/api/seeds", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Failed to load seeds");
        }

        const seeds = (await response.json()) as SeedResponse[];

        if (isMounted) {
          setNotes(seeds);
        }
      } catch {
        if (isMounted) {
          setError("読み込めませんでした。時間をおいてもう一度お試しください。");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSeeds();

    return () => {
      isMounted = false;
    };
  }, []);

  const canSubmit = text.trim().length > 0 && !isSaving;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsDialogOpen(true);
  }

  async function addNote() {
    const trimmedText = text.trim();

    if (!trimmedText || isSaving) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/seeds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: trimmedText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "保存できませんでした。もう一度お試しください。");
        return;
      }

      const seed = (await response.json()) as SeedResponse;

      setNotes((currentNotes) => [seed, ...currentNotes]);
      setText("");
      setIsDialogOpen(false);
      setIsSaved(true);
      window.setTimeout(() => setIsSaved(false), 1800);
    } catch {
      setError("保存できませんでした。入力内容を確認して、もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="px-5 pb-6 pt-6">
      <div>
        <h2 className="text-3xl font-semibold leading-10 text-gray-900">なんでもボックス</h2>
        <p className="mt-2 text-base leading-7 text-gray-700">
          困りごとや、やってみたいことを書いて入れる場所です。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
          <label className="block">
            <span className="sr-only">内容</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={8}
              placeholder="例：みんなで使う道具を片づけやすくしたい"
              className="block w-full resize-none bg-white px-4 py-4 text-base leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-100"
            />
          </label>
        </div>

        <div className="space-y-3">
          <motion.button
            type="submit"
            disabled={!canSubmit}
            whileTap={canSubmit ? { scale: 0.97 } : undefined}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-green-700 px-4 text-base font-semibold text-white shadow-sm transition enabled:hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSaved ? (
              <CheckCircle2 size={18} aria-hidden="true" />
            ) : (
              <Send size={18} aria-hidden="true" />
            )}
            {isSaved ? "入れました" : "ボックスに入れる"}
          </motion.button>
          {error && <p className="text-sm leading-6 text-red-600">{error}</p>}
        </div>
      </form>

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
                  <Dialog.Title className="text-lg font-semibold leading-7 text-gray-900">
                    ボックスに入れますか？
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm leading-6 text-gray-600">
                    入れる前に内容を確認してください。
                  </Dialog.Description>

                  <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                    <p>{text.trim()}</p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {error && <p className="text-sm leading-6 text-red-600">{error}</p>}
                    <div className="flex justify-end gap-2">
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="min-h-11 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          もどる
                        </button>
                      </Dialog.Close>
                      <motion.button
                        type="button"
                        onClick={addNote}
                        disabled={isSaving}
                        whileTap={!isSaving ? { scale: 0.97 } : undefined}
                        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-green-700 px-4 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        <Send size={18} aria-hidden="true" />
                        {isSaving ? "入れています" : "入れる"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <AnimatePresence>
        {isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5 text-sm leading-6 text-gray-500"
          >
            読み込み中...
          </motion.p>
        )}
        {notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-5"
          >
            <h3 className="text-base font-semibold text-gray-900">入っているもの</h3>
            <motion.ul layout className="mt-3 space-y-3">
              <AnimatePresence initial={false}>
                {notes.map((note) => (
                  <motion.li
                    layout
                    key={note.id}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 16, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200"
                  >
                    <div>
                      <div className="flex gap-2">
                        {note.tags.split(",").map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-900">
                        {note.content}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
