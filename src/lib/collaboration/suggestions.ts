import { CollaborationError, validateCollaborationState, type CollaborationState, type CollaborationActor } from "./schema.ts";

/** Keep server-derived state writable through the bounded general { state } endpoint. */
function checkedRoomTransition(input: CollaborationState): CollaborationState {
  const state = validateCollaborationState(input);
  if (new TextEncoder().encode(JSON.stringify({ state })).length > 512 * 1024) throw new CollaborationError(413, "This room has reached its safe content size limit. Remove other board content before applying this change.");
  return state;
}

/** General board writes can append proposals; review is a separate owner transaction. */
export function assertSuggestionAppendOnly(previous: CollaborationState, next: CollaborationState) {
  if (JSON.stringify(previous.planningIdeas || []) !== JSON.stringify(next.planningIdeas || [])) throw new CollaborationError(403, "Route and stay ideas can only change through owner review.");
  if (JSON.stringify(previous.interactions || { votes: [], comments: [] }) !== JSON.stringify(next.interactions || { votes: [], comments: [] })) throw new CollaborationError(403, "Votes and comments can only change through authenticated room actions.");
  for (const suggestion of previous.suggestions || []) {
    if (JSON.stringify(next.suggestions?.find(item => item.id === suggestion.id)) !== JSON.stringify(suggestion)) throw new CollaborationError(403, "Existing suggestions can only change through owner review.");
  }
  const previousIds = new Set((previous.suggestions || []).map(item => item.id));
  if (next.suggestions?.some(item => !previousIds.has(item.id) && item.status !== "pending")) throw new CollaborationError(403, "New suggestions must await owner review.");
}

export function reviewCollaborationSuggestion(input: CollaborationState, suggestionId: unknown, decision: unknown): CollaborationState {
  if (typeof suggestionId !== "string" || (decision !== "apply" && decision !== "reject")) throw new CollaborationError(400, "Choose a suggestion and apply or reject it.");
  const state = validateCollaborationState(input);
  const proposal = state.suggestions?.find(item => item.id === suggestionId);
  if (!proposal || proposal.status !== "pending") throw new CollaborationError(409, "This suggestion is no longer pending. Reload the board.");
  const next = structuredClone(state);
  next.suggestions = next.suggestions!.map(item => item.id === suggestionId ? { ...item, status: decision === "apply" ? "applied" : "rejected" } : item);
  if (decision === "apply" && (proposal.kind === "route" || proposal.kind === "stay")) {
    next.planningIdeas = [...(next.planningIdeas || []), proposal.idea];
  } else if (decision === "apply" && (proposal.kind === "activity" || proposal.kind === "day")) {
    const activityId = proposal.kind === "activity" ? proposal.activity.id : proposal.activityId;
    if (proposal.kind === "activity") next.activities.push(proposal.activity);
    if (proposal.day) {
      next.days = Object.fromEntries(Object.entries(next.days).map(([day, ids]) => [day, ids.filter(id => id !== activityId)]));
      next.days[proposal.day] = [...(next.days[proposal.day] || []), activityId];
    }
  }
  return checkedRoomTransition(next);
}

/** Server supplies the resolved access pseudonym, timestamp and record ID. */
export function recordSuggestionInteraction(input: CollaborationState, actor: CollaborationActor, suggestionId: unknown, action: unknown, value: unknown, timestamp: string, commentId: string): CollaborationState {
  const state = validateCollaborationState(input);
  if (typeof suggestionId !== "string" || !state.suggestions?.some(item => item.id === suggestionId && item.status === "pending")) throw new CollaborationError(409, "Only pending suggestions accept votes and comments.");
  const next = structuredClone(state);
  next.interactions = next.interactions || { votes: [], comments: [] };
  if (action === "vote") {
    if (value !== "support" && value !== "concern" && value !== "neutral") throw new CollaborationError(400, "Choose support, concern or neutral.");
    const vote = { suggestionId, actor, choice: value as "support" | "concern" | "neutral", updatedAt: timestamp };
    const index = next.interactions.votes.findIndex(item => item.suggestionId === suggestionId && item.actor.id === actor.id);
    if (index === -1) next.interactions.votes.push(vote); else next.interactions.votes[index] = vote;
  } else if (action === "comment") {
    if (typeof value !== "string") throw new CollaborationError(400, "Enter a share-safe comment.");
    next.interactions.comments.push({ id: commentId, suggestionId, actor, text: value, createdAt: timestamp });
  } else throw new CollaborationError(400, "Choose a vote or comment action.");
  return checkedRoomTransition(next);
}
