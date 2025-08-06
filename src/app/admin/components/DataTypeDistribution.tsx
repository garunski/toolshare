"use client";

import { Badge } from "@/primitives/badge";

const DATA_TYPE_COLORS = {
  text: "bg-blue-100 text-blue-800",
  number: "bg-green-100 text-green-800",
  boolean: "bg-purple-100 text-purple-800",
  date: "bg-yellow-100 text-yellow-800",
  select: "bg-orange-100 text-orange-800",
  multi_select: "bg-red-100 text-red-800",
  url: "bg-indigo-100 text-indigo-800",
  email: "bg-pink-100 text-pink-800",
};

interface DataTypeDistributionProps {
  attributes: any[];
}

export function DataTypeDistribution({
  attributes,
}: DataTypeDistributionProps) {
  const typeDistribution = attributes.reduce(
    (acc, attr) => {
      acc[attr.data_type] = (acc[attr.data_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div>
      <h4 className="mb-3 font-medium">Data Type Distribution</h4>
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeDistribution)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .map(([type, count]) => (
            <div key={type} className="flex items-center space-x-2">
              <Badge
                className={
                  DATA_TYPE_COLORS[type as keyof typeof DATA_TYPE_COLORS]
                }
                color="zinc"
              >
                {`${type}: ${count}`}
              </Badge>
            </div>
          ))}
      </div>
    </div>
  );
}
