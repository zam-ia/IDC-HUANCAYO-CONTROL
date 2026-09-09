export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f6f9] px-6">
      <div className="text-center">
        <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-[#00569d]/15 border-t-[#00569d]" />
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Abriendo IDC Control…
        </p>
      </div>
    </main>
  );
}
