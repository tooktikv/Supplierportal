"use client";

import { useParams } from "next/navigation";
import SampleSubmissionForm from "@/components/sample-requests/SampleSubmissionForm";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <SampleSubmissionForm key={id} id={id} />;
}
