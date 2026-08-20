export default function LoadingPlutosLibrary() {
  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <div className="h-8 w-40 rounded-lg bg-neutral-200" />
      <div className="mt-5 h-16 max-w-3xl rounded-2xl bg-neutral-200" />
      <div className="mt-10 h-20 rounded-3xl bg-neutral-200" />
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="h-80 rounded-2xl bg-neutral-200" key={index} />
        ))}
      </div>
    </main>
  );
}
