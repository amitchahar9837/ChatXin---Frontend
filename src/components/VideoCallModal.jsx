import { useEffect } from "react";
import { PhoneOff, Video } from "lucide-react";
import { useVideoCallContext } from "./chat/VideoCallContext";

const VideoCallModal = () => {
  const {
    callStatus,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    acceptCall,
    rejectCall,
    endCall,
  } = useVideoCallContext();

  if (callStatus === "idle") return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
      {callStatus === "ringing" && incomingCall && (
        <div className="bg-gray-900 p-6 rounded-xl text-center">
          <p className="text-white mb-4">
            {incomingCall.callerInfo?.name || "Someone"} is calling...
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={acceptCall}
              className="bg-green-500 p-3 rounded-full"
            >
              <Video className="text-white" />
            </button>
            <button
              onClick={rejectCall}
              className="bg-red-500 p-3 rounded-full"
            >
              <PhoneOff className="text-white" />
            </button>
          </div>
        </div>
      )}

      {(callStatus === "calling" || callStatus === "connected") && (
        <div className="relative w-full h-full">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-40 h-28 rounded-lg border-2 border-white object-cover"
          />
          <button
            onClick={endCall}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-500 p-4 rounded-full"
          >
            <PhoneOff className="text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCallModal;
