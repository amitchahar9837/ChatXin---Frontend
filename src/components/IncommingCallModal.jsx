import { useVideoCallContext } from "./chat/VideoCallContext";

export const IncomingCallModal = () => {
  const { incomingCall, acceptCall, rejectCall } = useVideoCallContext();

  if (!incomingCall) return null; // 👈 agar ye hamesha null hi reh raha hai, to modal kabhi render nahi hoga

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-1 p-6 rounded-xl text-center">
        <h2>{incomingCall.callerInfo?.name} is calling...</h2>
        <div className="flex gap-4 mt-4 justify-center">
          <button
            onClick={acceptCall}
            className="bg-green-500 px-4 py-2 rounded"
          >
            Accept
          </button>
          <button onClick={rejectCall} className="bg-red-500 px-4 py-2 rounded">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};
