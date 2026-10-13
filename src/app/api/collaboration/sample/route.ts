import { loadCurrentTrip } from "@/lib/current-trip";
import { publicSampleCollaborationState } from "@/lib/collaboration/sample";
import { handle, json } from "@/lib/collaboration/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  return handle(async () => {
    const trip = await loadCurrentTrip({ allowPrivate: false });
    const state = publicSampleCollaborationState(trip);
    return json({ state, metadata: { activityCount: state.activities.length, assignedActivityCount: Object.values(state.days).reduce((sum, ids) => sum + ids.length, 0), plannedDayCount: Object.keys(state.days).length, omittedActivityCount: trip.activities.length - state.activities.length } });
  });
}
