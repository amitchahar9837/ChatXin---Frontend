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
        <div className="flex flex-col items-center gap-8 animate-in fade-in duration-300">
          {/* Avatar with pulsing rings */}
          <div className="relative flex items-center justify-center">
            <span className="absolute w-40 h-40 rounded-full bg-teal/20 animate-ping" />
            <span className="absolute w-32 h-32 rounded-full bg-teal/10" />
            {incomingCall.callerInfo?.profilePic ? (
              <img
                src={incomingCall.callerInfo.profilePic}
                alt={incomingCall.callerInfo?.name}
                className="relative w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-xl"
              />
            ) : (
              <div className="relative w-24 h-24 rounded-full bg-surface-3 border-4 border-white/20 shadow-xl flex items-center justify-center text-3xl font-semibold text-white">
                {incomingCall.callerInfo?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          {/* Name + status */}
          <div className="text-center">
            <h2 className="text-white text-2xl font-display font-semibold">
              {incomingCall.callerInfo?.name || "Someone"}
            </h2>
            <p className="text-white/60 text-sm mt-1">Incoming video call...</p>
          </div>

          {/* Accept / Reject buttons with labels */}
          <div className="flex gap-16 mt-4">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={rejectCall}
                className="bg-red-500 hover:bg-red-600 active:scale-95 transition-all p-5 rounded-full shadow-lg shadow-red-500/30"
              >
                <PhoneOff className="text-white" size={26} />
              </button>
              <span className="text-white/70 text-xs">Decline</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={acceptCall}
                className="bg-green-500 hover:bg-green-600 active:scale-95 transition-all p-5 rounded-full shadow-lg shadow-green-500/30 animate-bounce"
              >
                <Video className="text-white" size={26} />
              </button>
              <span className="text-white/70 text-xs">Accept</span>
            </div>
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
