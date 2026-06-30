import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

type MinuteComment = {
  id: string;
  comment: string;
  createdAt: string;
  minute: {
    id: string;
    title: string;
    date: string;
  };
};

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

function formatMinuteDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date));
}

export default async function CommentsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
    cache: "no-store"
  });
  const comments = (await res.json()) as MinuteComment[];

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
          <h2 className="text-2xl font-semibold text-gray-900">コメント一覧</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            決まったことに寄せられたコメントを新しい順に表示します。
          </p>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center shadow-sm ring-1 ring-gray-200">
          <MessageCircle className="mx-auto text-gray-300" size={36} aria-hidden="true" />
          <p className="mt-3 text-sm leading-6 text-gray-600">まだコメントはありません。</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-gray-500">
                <time>{formatDateTime(comment.createdAt)}</time>
                <span aria-hidden="true">/</span>
                <time>{formatMinuteDate(comment.minute.date)}</time>
              </div>
              <Link
                href="/"
                className="mt-1 block text-sm font-semibold leading-6 text-green-800 transition hover:text-green-900"
              >
                {comment.minute.title}
              </Link>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-900">
                {comment.comment}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
