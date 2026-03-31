"use client";

import { useState, useCallback } from "react";

export type SortOption = "date-asc" | "date-desc" | "amount-asc" | "amount-desc";

export interface ExpenseFiltersState {
  categories: string[];
  sort: SortOption;
}

export interface ExpenseFiltersProps {
  onFilterChange: (filters: ExpenseFiltersState) => void;
  categories: string[];
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date-asc", label: "Date ↑" },
  { value: "date-desc", label: "Date ↓" },
  { value: "amount-asc", label: "Amount ↑" },
  { value: "amount-desc", label: "Amount ↓" },
];

export function ExpenseFilters({
  onFilterChange,
  categories: availableCategories,
}: ExpenseFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("date-desc");

  const toggleCategory = useCallback(
    (category: string) => {
      const next = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category];
      setSelectedCategories(next);
      onFilterChange({ categories: next, sort });
    },
    [selectedCategories, sort, onFilterChange]
  );

  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      setSort(newSort);
      onFilterChange({ categories: selectedCategories, sort: newSort });
    },
    [selectedCategories, onFilterChange]
  );

  const handleClear = useCallback(() => {
    setSelectedCategories([]);
    setSort("date-desc");
    onFilterChange({ categories: [], sort: "date-desc" });
  }, [onFilterChange]);

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="expense-filters"
    >
      <div className="flex flex-wrap gap-1">
        {availableCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => toggleCategory(cat)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedCategories.includes(cat)
                ? "bg-accent text-white"
                : "bg-surface-muted text-text-secondary hover:bg-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex rounded-lg border border-border p-0.5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSortChange(opt.value)}
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              sort === opt.value
                ? "bg-accent text-white"
                : "text-text-secondary hover:bg-surface-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="rounded px-2 py-1 text-sm text-text-secondary hover:text-text-primary"
      >
        Clear
      </button>
    </div>
  );
}
