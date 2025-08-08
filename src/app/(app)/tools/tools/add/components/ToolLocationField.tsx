export function ToolLocationField() {
  return (
    <div>
      <label
        htmlFor="location"
        className="block text-sm font-medium text-gray-700"
      >
        Location *
      </label>
      <input
        type="text"
        id="location"
        name="location"
        required
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        placeholder="Where is the tool located?"
      />
    </div>
  );
}
