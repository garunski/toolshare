import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  description: string;
  content: string;
  buttonText: string;
  href: string;
}

export function DashboardCard({
  title,
  description,
  content,
  buttonText,
  href,
}: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-600">{content}</p>
        <Link href={href}>
          <Button className="w-full">{buttonText}</Button>
        </Link>
      </CardContent>
    </Card>
  );
} 