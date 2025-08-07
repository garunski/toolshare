"use client";

export function HelpText() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start space-x-2">
        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
        <div>
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Be specific and honest about your item&apos;s
            condition. Clear descriptions and accurate condition ratings help
            build trust with potential borrowers.
          </p>
        </div>
      </div>
    </div>
  );
}
