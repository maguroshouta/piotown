export default function Header() {
  return (
    <header className="w-full bg-white p-2 shadow-sm">
      <div className="flex items-center gap-4 mx-auto max-w-2xl">
        <img src="/icon.png" width={48} height={48} alt="ロゴ" className="rounded-full" />
        <h1 className="text-2xl text-gray-800">ぴおタウン</h1>
      </div>
    </header>
  );
}
