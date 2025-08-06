import { Badge } from "@/primitives/badge";
import type { AttributeDefinition } from "@/types/categories";

interface RecentAttributesListProps {
  attributes: AttributeDefinition[];
}

export function RecentAttributesList({ attributes }: RecentAttributesListProps) {
  if (attributes.length === 0) return null;

  const recentAttributes = attributes
    .sort(
      (a, b) =>
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime(),
    )
    .slice(0, 5);

  return (
    <div>
      <h4 className="mb-3 font-medium">Recent Attributes</h4>
      <div className="space-y-2">
        {recentAttributes.map((attr) => (
          <div key={attr.id} className="rounded bg-gray-50 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {attr.display_label}
                </span>
                                        <Badge color="zinc">
                          {attr.data_type}
                        </Badge>
                        {attr.is_required && (
                          <Badge color="red">
                            Required
                          </Badge>
                        )}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(attr.created_at || '').toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 