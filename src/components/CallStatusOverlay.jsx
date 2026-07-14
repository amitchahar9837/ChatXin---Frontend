import { useVideoCallContext } from "./chat/VideoCallContext";

export const CallStatusOverlay = () => {
  const { callStatus, endCall } = useVideoCallContext();

  if (callStatus === "idle" || callStatus === "ringing") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="text-center text-white">
        {callStatus === "calling" && <p>Calling...</p>}
        {callStatus === "connected" && <p>Connected</p>}
        <button onClick={endCall} className="mt-4 bg-red-500 px-4 py-2 rounded">
          End Call
        </button>
      </div>
    </div>
  );
};
