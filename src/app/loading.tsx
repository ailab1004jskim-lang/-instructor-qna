export default function Loading() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2.5 text-sm text-sub"
      >
        <span
          aria-hidden="true"
          className="w-4 h-4 rounded-full border-2 border-line border-t-primary animate-spin"
        />
        불러오는 중…
      </div>
    </main>
  );
}
