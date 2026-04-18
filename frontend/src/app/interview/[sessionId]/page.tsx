/**
 * Active Interview Session Page — Phase 1-3
 * Status: 🔲 Not Started
 *
 * The main interview UI with:
 * - Question display
 * - Code editor (for coding questions)
 * - Voice controls (Phase 3)
 * - Anti-cheat overlay (Phase 4)
 */

export default function InterviewSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  return (
    <div>
      <h1>Interview Session: {params.sessionId}</h1>
      <p>TODO: Implement active interview session UI</p>
    </div>
  );
}
