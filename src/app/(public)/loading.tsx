import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <section className="py-6 text-center sm:py-10">
        <Skeleton className="mx-auto h-10 w-full max-w-2xl" />
        <Skeleton className="mx-auto mt-3 h-5 w-64" />
        <Skeleton className="mx-auto mt-6 h-24 max-w-2xl" />
      </section>

      <section className="border-line border-t py-10">
        <Skeleton className="mb-4 h-4 w-40" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </section>

      <section className="border-line border-t py-10">
        <Skeleton className="mb-4 h-5 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </section>
    </div>
  );
}
