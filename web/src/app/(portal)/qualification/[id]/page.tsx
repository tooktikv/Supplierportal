import QualificationDetail from "@/components/qualification/QualificationDetail";
import { initial } from "@/lib/data";

export const generateStaticParams = () => initial.qsl.requests.filter((request) => request.supplierId === initial.profile.id).map((request) => ({ id: request.id }));

export default async function Page({ params }: PageProps<"/qualification/[id]">) {
  const { id } = await params;
  return <QualificationDetail key={id} id={id} />;
}
