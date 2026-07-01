"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Plus } from "lucide-react";
import MinuteComments from "@/components/minute-comments";
import MinuteReactions from "@/components/minute-reactions";
import { useEffect, useState } from "react";

type Minute = {
  id: string;
  title: string;
  date: string;
  published: boolean;
  createdAt: string;
  items: {
    label: string;
    value: string;
  }[];
  _count: {
    minuteComments: number;
  };
  reactionCounts: Record<string, number>;
};

export default function Home() {
  const [minutes, setMinutes] = useState<Minute[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMinutes = async () => {
      const response = await fetch("/api/minutes");
      const data = await response.json();
      setMinutes(data);
      setLoading(false);
    };

    fetchMinutes();
  }, []);

  return (
    <section className="px-5 pb-6 pt-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="mt-1 text-2xl font-semibold text-gray-900">決まったこと</h2>
        <Link
          href="/minutes/new"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-green-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
        >
          <Plus size={18} aria-hidden="true" />
          新規作成
        </Link>
      </div>

      <ol className="space-y-0">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : (
          minutes.map((minute, index) => (
            <li key={minute.id} className="relative pb-9 last:pb-0">
              <div className="grid grid-cols-[24px_1fr] gap-x-4">
                <div className="relative flex justify-center">
                  <span className="mt-0.5 h-6 w-6 rounded-full border-4 border-white bg-green-600 shadow-sm ring-2 ring-green-600" />
                  {index < minutes.length - 1 && (
                    <span className="absolute top-8 -bottom-9 w-0.5 bg-gray-300" />
                  )}
                </div>

                <div>
                  <time className="block text-xl font-semibold leading-none text-gray-900">
                    {format(new Date(minute.date), "yyyy年M月d日")}
                  </time>
                  <div className="mt-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      {minute.title}
                    </h3>
                    <dl className="mt-3 space-y-3">
                      {minute.items.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-md border border-gray-100 bg-white p-3"
                        >
                          <dt className="text-sm font-semibold leading-6 text-green-800">
                            {item.label}
                          </dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-800">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <MinuteReactions minuteId={minute.id} reactions={minute.reactionCounts} />
                    <MinuteComments
                      minuteId={minute.id}
                      commentCount={minute._count.minuteComments}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
