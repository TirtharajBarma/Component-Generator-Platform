"use client";
import { useEffect } from "react";
import Playground from "../components/Playground";
import { useAppDispatch, useSession } from "../store/hooks";
import { fetchSessions, createSession } from "../store/thunks";
import { setCurrentSession, clearError } from "../store/slices/sessionSlice";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { sessions, currentSession, loading, creating, error } = useSession();

  // Fetch sessions on mount
  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  // Retry fetch sessions
  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchSessions());
  };

  // Create new session
  const handleCreateSession = async () => {
    try {
      await dispatch(createSession()).unwrap();
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  if (currentSession) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-start p-0 sm:p-8">
        <button
          className="mb-4 text-black hover:underline text-sm font-medium px-2 py-1 rounded transition"
          onClick={() => dispatch(setCurrentSession(null))}
        >
          ← Back to sessions
        </button>
        <div className="text-xl font-bold mb-4 text-black">
          Playground for session: <span className="font-mono">{currentSession._id}</span>
        </div>
        <div className="w-full max-w-5xl mx-auto">
          <Playground session={currentSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 sm:p-8">
      <div className="bg-white border border-black/10 p-6 sm:p-10 rounded-xl shadow-sm w-full max-w-md sm:max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center text-black tracking-tight">Your Sessions</h1>
        {error && (
          <div className="mb-4 text-red-600 text-center">
            {error}
            <div>
              <button className="mt-2 px-3 py-1 bg-black text-white rounded" onClick={handleRetry}>
                Retry
              </button>
            </div>
          </div>
        )}
        <button
          onClick={handleCreateSession}
          className="mb-8 w-full bg-black text-white py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-black border border-black transition disabled:opacity-50"
          disabled={creating}
        >
          {creating ? "Creating..." : "+ New Session"}
        </button>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : sessions.length === 0 && !error ? (
          <div className="text-center text-gray-400 italic">No sessions found.</div>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li
                key={session._id}
                className="flex items-center justify-between p-4 border border-black/10 rounded-lg bg-white hover:bg-black hover:text-white transition cursor-pointer shadow-sm"
                onClick={() => dispatch(setCurrentSession(session))}
              >
                <span className="font-mono text-base font-medium">Session {session._id.slice(-6)}</span>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(session.updatedAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
