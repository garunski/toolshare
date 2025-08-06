"use client";

import {
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Heading } from "@/primitives/heading";
import { useAttributes } from "@/common/hooks/useAttributes";

import { RecentAttributesList } from "./RecentAttributesList";

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

export function AttributeMetrics() {
  const { attributes, loading } = useAttributes();

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="animate-pulse">
          <div className="mb-6 h-6 w-1/3 rounded bg-gray-200"></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: attributes.length,
    required: attributes.filter((attr) => attr.is_required).length,
    searchable: attributes.filter((attr) => attr.is_searchable).length,
    filterable: attributes.filter((attr) => attr.is_filterable).length,
    withOptions: attributes.filter(
      (attr) => attr.options && typeof attr.options === 'object' && 'options' in attr.options,
    ).length,
  };

  const typeDistribution = attributes.reduce((acc, attr) => {
    acc[attr.data_type] = (acc[attr.data_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
          <Heading level={3}>Attribute Overview</Heading>
        </div>
        <Badge color="zinc">{stats.total} attributes</Badge>
      </div>

      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Required</p>
                <p className="text-2xl font-bold text-red-900">{stats.required}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Searchable</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.searchable}
                </p>
              </div>
              <MagnifyingGlassIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Filterable</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.filterable}
                </p>
              </div>
              <FunnelIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="rounded-lg bg-purple-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  With Options
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.withOptions}
                </p>
              </div>
              <AdjustmentsHorizontalIcon className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Data Type Distribution */}
        <div>
          <h4 className="mb-3 font-medium">Data Type Distribution</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center space-x-2">
                  <Badge
                    className={
                      DATA_TYPE_COLORS[type as keyof typeof DATA_TYPE_COLORS]
                    }
                    color="zinc"
                  >
                    {type}: {count}
                  </Badge>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Attributes */}
        <RecentAttributesList attributes={attributes} />
      </div>
    </div>
  );
} 