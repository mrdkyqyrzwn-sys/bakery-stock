import type { Metadata } from "next";
import { Studio } from "@/components/Studio";

export const metadata: Metadata = { title: "הסרטון שלך", robots: { index: false, follow: false } };

export default async function CreatePage({ params }: PageProps<"/create/[id]">) {
  const { id } = await params;
  return <Studio id={id} />;
}
