export function ToolConditionField() {
  return (
    <div>
      <label
        htmlFor="condition"
        className="block text-sm font-medium text-gray-700"
      >
        Condition *
      </label>
      <select
        id="condition"
        name="condition"
        required
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      >
        <option value="">Select condition</option>
        <option value="new">New</option>
        <option value="like_new">Like New</option>
        <option value="excellent">Excellent</option>
        <option value="good">Good</option>
        <option value="fair">Fair</option>
        <option value="poor">Poor</option>
      </select>
    </div>
  );
}
