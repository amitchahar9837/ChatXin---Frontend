import { PhoneOff, Video } from "lucide-react";
import { useVideoCallContext } from "./chat/VideoCallContext";

const STATUS_TEXT = {
  calling: "Calling...",
  connecting: "Connecting...",
};

const VideoCallModal = () => {
  const {
    callStatus,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    remoteStream,
    acceptCall,
    rejectCall,
    endCall,
  } = useVideoCallContext();

  if (callStatus === "idle") return null;

  const showLocalFullscreen = !remoteStream;
  const statusText = STATUS_TEXT[callStatus];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
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

      {(callStatus === "calling" ||
        callStatus === "connecting" ||
        callStatus === "connected") && (
        <div className="relative w-full h-full">
          {/* Remote video — sirf tab dikhega jab stream mile */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${remoteStream ? "" : "hidden"}`}
          />

          {/* Local video — remote connect hone tak fullscreen, uske baad chhota corner */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ transform: "scaleX(-1)" }}
            className={
              showLocalFullscreen
                ? "w-full h-full object-cover"
                : "absolute bottom-4 right-4 w-40 h-28 rounded-lg border-2 border-white object-cover"
            }
          />

          {/* Status text — sirf tab tak dikhega jab remote video na aaye */}
          {showLocalFullscreen && statusText && (
            <p className="absolute top-10 left-1/2 -translate-x-1/2 text-white text-lg font-medium bg-black/40 px-4 py-2 rounded-full">
              {statusText}
            </p>
          )}

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
