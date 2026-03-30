export default function Header() {
  return (
    <div className="w-full h-20 bg-white flex items-center justify-between px-6 border-b">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded"></div>
        <span className="text-xl font-semibold">Altify Obituaries</span>
      </div>

      <a href="/api/checkout">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Upgrade
        </button>
      </a>
    </div>
  );
}