import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card p-4">
        <span className="text-lg font-semibold">Foodstore Backoffice</span>
      </header>
      <div className="flex flex-1">
        <aside className="w-56 border-r border-border bg-card p-4">
          <nav aria-label="Principal">
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/"
                  className="block rounded-md px-3 py-2 hover:bg-bg focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Inicio
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
