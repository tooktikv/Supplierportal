"use client";

import { useParams } from "next/navigation";
import SampleDetails from "@/components/sample-requests/SampleDetails";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <SampleDetails key={id} id={id} />;
}
