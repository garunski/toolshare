import { Avatar } from "@/primitives/avatar";
import { Heading } from "@/primitives/heading";
import { Text } from "@/primitives/text";

interface ToolOwnerInfoProps {
  owner: {
    id: string;
    first_name: string;
    last_name: string;
    bio: string | null;
  };
}

export function ToolOwnerInfo({ owner }: ToolOwnerInfoProps) {
  const initials = `${owner.first_name[0]}${owner.last_name[0]}`.toUpperCase();
  const fullName = `${owner.first_name} ${owner.last_name}`;

  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-4">
        <Heading level={3} className="text-lg font-semibold">
          Tool Owner
        </Heading>
      </div>
      <div>
        <div className="flex items-center gap-4">
          <Avatar initials={initials} />
          <div className="flex-1">
            <Text className="font-semibold text-gray-900 dark:text-white">
              {fullName}
            </Text>
            {owner.bio && (
              <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {owner.bio}
              </Text>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
