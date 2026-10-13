import CollaborationWorkspace from "@/components/collaboration-workspace";

export default async function SharedPlanPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <CollaborationWorkspace roomId={roomId} />;
}
