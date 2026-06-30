"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Lightbulb, MessageSquareText, Send, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "radix-ui";

type SeedKind = "trouble" | "idea";

type SeedNote = {
  id: string;
  kind: SeedKind;
  content: string;
  createdAt: string;
};

type SeedResponse = {
  id: string;
  kind: "TROUBLE" | "IDEA";
  content: string;
  createdAt: string;
};

const kindOptions: Array<{
  label: SeedKind;
  icon: typeof MessageSquareText;
}> = [
  { label: "trouble", icon: MessageSquareText },
  { label: "idea", icon: Lightbulb }
];

function getKindLabel(kind: SeedKind) {
  return kind === "trouble" ? "困ってる！" : "やってみたい！";
}

function toSeedNote(seed: SeedResponse): SeedNote {
  return {
    id: seed.id,
    kind: seed.kind === "IDEA" ? "idea" : "trouble",
    content: seed.content,
    createdAt: seed.createdAt
  };
}

export default function SeedBox() {
  const [kind, setKind] = useState<SeedKind>("trouble");
  const [text, setText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState<SeedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
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
          setNotes(seeds.map(toSeedNote));
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
          kind,
          content: trimmedText
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save seed");
      }

      const seed = (await response.json()) as SeedResponse;

      setNotes((currentNotes) => [toSeedNote(seed), ...currentNotes]);
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

  async function deleteNote(id: string) {
    if (deletingNoteId) {
      return;
    }

    setDeletingNoteId(id);
    setError("");

    try {
      const response = await fetch(`/api/seeds/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError("作成したときと同じIPアドレスからのみ削除できます。");
          return;
        }

        throw new Error("Failed to delete seed");
      }

      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    } catch {
      setError("削除できませんでした。時間をおいてもう一度お試しください。");
    } finally {
      setDeletingNoteId(null);
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
          <fieldset className="border-b border-gray-100 p-2">
            <legend className="sr-only">書くこと</legend>
            <div className="grid grid-cols-2 gap-2">
              {kindOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = kind === option.label;

                return (
                  <motion.button
                    key={option.label}
                    type="button"
                    onClick={() => setKind(option.label)}
                    whileTap={{ scale: 0.97 }}
                    className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                      isSelected
                        ? "border-green-700 bg-green-50 text-green-800"
                        : "border-transparent bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {getKindLabel(option.label)}
                  </motion.button>
                );
              })}
            </div>
          </fieldset>

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
                    <span className="inline-flex rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                      {getKindLabel(kind)}
                    </span>
                    <p className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-gray-900">
                      {text.trim()}
                    </p>
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
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                          {getKindLabel(note.kind)}
                        </span>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-900">
                          {note.content}
                        </p>
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => deleteNote(note.id)}
                        disabled={deletingNoteId !== null}
                        aria-label="削除"
                        whileTap={deletingNoteId === null ? { scale: 0.94 } : undefined}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-400 transition enabled:hover:bg-gray-100 enabled:hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </motion.button>
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
