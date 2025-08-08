export function ToolDescriptionField() {
  return (
    <div>
      <label
        htmlFor="description"
        className="block text-sm font-medium text-gray-700"
      >
        Description *
      </label>
      <textarea
        id="description"
        name="description"
        required
        rows={4}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        placeholder="Describe your tool"
      />
    </div>
  );
}
