import SampleSubmissionForm from "@/components/sample-requests/SampleSubmissionForm";
import { initial } from "@/lib/data";

export const generateStaticParams = () => initial.requests.map((request) => ({ id: request.id }));

export default async function Page({ params }: PageProps<"/sample-requests/[id]/respond">) {
  const { id } = await params;
  return <SampleSubmissionForm key={id} id={id} />;
}
