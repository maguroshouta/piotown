"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";

type MinuteItemInput = {
  id: string;
  label: string;
  value: string;
};

function createEmptyItem(): MinuteItemInput {
  return {
    id: crypto.randomUUID(),
    label: "",
    value: ""
  };
}

function getTodayInputValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

export default function NewMinutePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(getTodayInputValue);
  const [items, setItems] = useState<MinuteItemInput[]>([createEmptyItem()]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasDate = date.length > 0;
    const hasItem = items.some(
      (item) => item.label.trim().length > 0 && item.value.trim().length > 0
    );

    return hasTitle && hasDate && hasItem && !isSaving;
  }, [date, isSaving, items, title]);

  function updateItem(id: string, field: "label" | "value", value: string) {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((currentItems) => [...currentItems, createEmptyItem()]);
  }

  function removeItem(id: string) {
    setItems((currentItems) =>
      currentItems.length === 1 ? currentItems : currentItems.filter((item) => item.id !== id)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setIsSaving(true);
    setError("");

    const response = await fetch("/api/minutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title.trim(),
        date,
        published: true,
        items: items
          .map((item) => ({
            label: item.label.trim(),
            value: item.value.trim()
          }))
          .filter((item) => item.label.length > 0 && item.value.length > 0)
      })
    });

    if (!response.ok) {
      setError("保存できませんでした。入力内容を確認して、もう一度お試しください。");
      setIsSaving(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <section className="px-5 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label="戻る"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">決まったことを作成</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">会議で決まった内容を記録します。</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold leading-6 text-gray-900">日付</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 block min-h-12 w-full rounded-md border border-gray-200 bg-white px-3 text-base text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold leading-6 text-gray-900">タイトル</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例：今日の会議で決まったこと"
                className="mt-1 block min-h-12 w-full rounded-md border border-gray-200 bg-white px-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-900">内容</h3>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-700">項目 {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  aria-label="項目を削除"
                  className="flex h-10 w-10 items-center justify-center rounded-md text-gray-400 transition enabled:hover:bg-gray-100 enabled:hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-semibold leading-6 text-gray-900">見出し</span>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(event) => updateItem(item.id, "label", event.target.value)}
                    placeholder="例：会議テーマの明確化"
                    className="mt-1 block min-h-12 w-full rounded-md border border-gray-200 bg-white px-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold leading-6 text-gray-900">内容</span>
                  <textarea
                    value={item.value}
                    onChange={(event) => updateItem(item.id, "value", event.target.value)}
                    rows={4}
                    placeholder="決まった内容を書いてください"
                    className="mt-1 block w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-3 text-base leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </label>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-dashed border-green-300 bg-white px-4 text-base font-semibold text-green-800 transition hover:bg-green-50"
          >
            <Plus size={18} aria-hidden="true" />
            項目を追加
          </button>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-green-700 px-4 text-base font-semibold text-white shadow-sm transition enabled:hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Save size={18} aria-hidden="true" />
          {isSaving ? "保存中" : "保存する"}
        </button>
      </form>
    </section>
  );
}
