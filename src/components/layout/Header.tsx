import MobileMenuButton from "./MobileMenuButton";

export default function Header() {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <MobileMenuButton />
        <span className="text-lg font-semibold text-slate-800">TriStateApp</span>
      </div>
      {/* User avatar placeholder */}
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
        U
      </div>
    </header>
  );
}
