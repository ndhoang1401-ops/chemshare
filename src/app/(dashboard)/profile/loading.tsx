import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-10">
      <section className="flex items-start gap-5">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
      </section>

      <Skeleton className="h-20 w-full" />

      <section>
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="h-24 w-full" />
      </section>
    </div>
  );
}
