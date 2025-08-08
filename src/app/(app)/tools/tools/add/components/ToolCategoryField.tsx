interface ToolCategoryFieldProps {
  categoryOptions: Array<{ value: string; label: string }>;
  categoriesLoading: boolean;
}

export function ToolCategoryField({
  categoryOptions,
  categoriesLoading,
}: ToolCategoryFieldProps) {
  return (
    <div>
      <label
        htmlFor="category"
        className="block text-sm font-medium text-gray-700"
      >
        Category *
      </label>
      <select
        id="category"
        name="category"
        required
        disabled={categoriesLoading}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">
          {categoriesLoading ? "Loading categories..." : "Select a category"}
        </option>
        {categoryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
