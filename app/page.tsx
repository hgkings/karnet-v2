export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <main className="flex flex-col items-center gap-6 text-center px-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Karnet
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Turkiye&apos;nin marketplace saticilarinin gercek net karini hesaplayan platform.
        </p>
        <p className="text-sm text-muted-foreground">
          v2 — Gelistirme asamasinda
        </p>
      </main>
    </div>
  );
}
