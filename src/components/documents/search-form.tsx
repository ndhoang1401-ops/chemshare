import { Search } from "lucide-react";
import { Select } from "@/components/ui/select";
import { GRADE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SearchFormProps {
  categories: { slug: string; name: string }[];
  defaultQuery?: string;
  defaultCategory?: string;
  defaultGrade?: string;
  large?: boolean;
}

export function SearchForm({
  categories,
  defaultQuery = "",
  defaultCategory = "",
  defaultGrade = "",
  large = false,
}: SearchFormProps) {
  return (
    <form
      action="/search"
      method="GET"
      className="border-line bg-paper-raised rounded-[var(--radius-tile)] border p-3"
    >
      <div className="border-line flex items-center gap-2 border-b pb-3">
        <Search className="text-ink-soft h-4 w-4 shrink-0" aria-hidden />
        <input
          type="text"
          name="q"
          defaultValue={defaultQuery}
          placeholder="Tìm theo tiêu đề, từ khóa, tác giả..."
          className={cn(
            "text-ink placeholder:text-ink-soft/70 w-full bg-transparent focus:outline-none",
            large ? "py-1 text-base" : "text-sm",
          )}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Select
          name="category"
          defaultValue={defaultCategory}
          className="h-9 w-auto min-w-40 flex-1 text-xs sm:flex-none"
        >
          <option value="">Tất cả chuyên đề</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </Select>

        <Select
          name="grade"
          defaultValue={defaultGrade}
          className="h-9 w-auto min-w-32 flex-1 text-xs sm:flex-none"
        >
          <option value="">Tất cả lớp</option>
          {Object.entries(GRADE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <button
          type="submit"
          className="bg-flame text-on-flame hover:bg-flame-strong ml-auto rounded-[var(--radius-tile)] px-4 py-2 text-sm font-medium transition-colors"
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
