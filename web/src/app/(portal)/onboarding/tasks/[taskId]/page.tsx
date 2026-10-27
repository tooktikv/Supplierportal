"use client";

import { useParams } from "next/navigation";
import TaskScreen from "@/components/onboarding/TaskScreen";

export default function Page() {
  const { taskId } = useParams<{ taskId: string }>();
  return <TaskScreen key={taskId} taskId={taskId} />;
}
