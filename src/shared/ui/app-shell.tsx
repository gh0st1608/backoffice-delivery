import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="p-4">
        <span className="text-lg font-semibold">Foodstore Backoffice</span>
      </header>
      <div className="flex flex-1">
        <aside className="w-56 p-4">
          <nav aria-label="Principal">
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/">Inicio</Link>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
