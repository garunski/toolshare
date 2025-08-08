import {
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Heading } from "@/primitives/heading";
import type { AttributeDefinition } from "@/types/categories";

import { DataTypeDistribution } from "./DataTypeDistribution";
import { RecentAttributesList } from "./RecentAttributesList";

interface AttributeStats {
  total: number;
  required: number;
  searchable: number;
  filterable: number;
  withOptions: number;
}

interface AttributeMetricsProps {
  attributes: AttributeDefinition[];
}

export function AttributeMetrics({ attributes }: AttributeMetricsProps) {
  const stats: AttributeStats = {
    total: attributes.length,
    required: attributes.filter((attr) => attr.is_required).length,
    searchable: attributes.filter((attr) => attr.is_searchable).length,
    filterable: attributes.filter((attr) => attr.is_filterable).length,
    withOptions: attributes.filter(
      (attr) =>
        attr.options &&
        typeof attr.options === "object" &&
        "options" in attr.options,
    ).length,
  };

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
                <p className="text-2xl font-bold text-red-900">
                  {stats.required}
                </p>
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
        <DataTypeDistribution attributes={attributes} />

        {/* Recent Attributes */}
        <RecentAttributesList attributes={attributes} />
      </div>
    </div>
  );
}
