import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-9 w-full max-w-xl" />
      <Skeleton className="mt-3 h-5 w-64" />
      <Skeleton className="mt-4 h-16 w-full" />
      <Skeleton className="mt-6 h-20 w-full" />
      <Skeleton className="mt-6 h-[400px] w-full" />
    </div>
  );
}
