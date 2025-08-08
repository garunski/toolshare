export function ToolNameField() {
  return (
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
        Tool Name *
      </label>
      <input
        type="text"
        id="name"
        name="name"
        required
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        placeholder="Enter tool name"
      />
    </div>
  );
}
