import SampleDetails from "@/components/sample-requests/SampleDetails";
import { initial } from "@/lib/data";

export const generateStaticParams = () => initial.requests.map((request) => ({ id: request.id }));

export default async function Page({ params }: PageProps<"/sample-requests/[id]">) {
  const { id } = await params;
  return <SampleDetails key={id} id={id} />;
}
