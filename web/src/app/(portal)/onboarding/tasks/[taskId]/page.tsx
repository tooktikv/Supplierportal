import TaskScreen from "@/components/onboarding/TaskScreen";
import { onboardingTasks } from "@/lib/onboarding";

export const generateStaticParams = () => onboardingTasks.map((task) => ({ taskId: task.id }));

export default async function Page({ params }: PageProps<"/onboarding/tasks/[taskId]">) {
  const { taskId } = await params;
  return <TaskScreen key={taskId} taskId={taskId} />;
}
