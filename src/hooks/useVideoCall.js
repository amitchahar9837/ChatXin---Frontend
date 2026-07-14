import { useState, useRef, useCallback, useEffect } from "react";
import Peer from "simple-peer";
import { getSocket } from "../lib/socket";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

export const useVideoCall = (myUserId) => {
  const [callStatus, setCallStatus] = useState("idle");
  const [incomingCall, setIncomingCall] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const otherUserIdRef = useRef(null);

  const socket = getSocket();

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  // ---- Caller side ----
  const callUser = useCallback(
    async (toUserId, callerInfo) => {
      console.log(
        "📞 callUser triggered, toUserId:",
        toUserId,
        "socket connected:",
        socket?.connected,
        "socket id:",
        socket?.id,
      );
      otherUserIdRef.current = toUserId;
      let stream;
      try {
        stream = await getLocalStream();
      } catch {
        otherUserIdRef.current = null;
        return;
      }
      setCallStatus("calling");

      const peer = new Peer({
        initiator: true,
        trickle: true,
        stream,
        config: { iceServers: ICE_SERVERS },
      });

      peer.on("signal", (offer) => {
        console.log("📡 signal generated, emitting call-user", offer.type);
        socket.emit("call-user", {
          toUserId,
          offer,
          fromUserId: myUserId,
          callerInfo,
        });
      });

      peer.on("connect", () => console.log("✅ peer connected (data channel)"));
      peer.on("iceStateChange", (state) => console.log("🧊 ICE state:", state));
      peer.on("stream", (remoteStream) => {
        console.log("🎥 remote stream received");
        if (remoteVideoRef.current)
          remoteVideoRef.current.srcObject = remoteStream;
        setCallStatus("connected");
      });

      peer.on("close", () => {
        console.log("❌ peer closed");
        endCall();
      });
      peer.on("error", (err) => {
        console.log("❌ peer error:", err);
        endCall();
      });

      peerRef.current = peer;

      socket.once("call-accepted", ({ answer }) => {
        console.log("✅ call-accepted received");
        peer.signal(answer);
      });

      socket.on("ice-candidate", ({ candidate }) => {
        console.log("🧊 ice-candidate received from remote");
        if (candidate) peer.signal(candidate);
      });
    },
    [myUserId],
  );

  // ---- Receiver side ----
  const listenForIncomingCalls = useCallback(() => {
    if (!socket) return;
    socket.on("incoming-call", ({ fromUserId, offer, callerInfo }) => {
      console.log("📥 incoming-call event received from:", fromUserId);
      setIncomingCall({ fromUserId, offer, callerInfo });
      setCallStatus("ringing");
      otherUserIdRef.current = fromUserId;
    });

    socket.on("call-ended", () => endCall());
    socket.on("call-rejected", () => endCall());
  }, []);

  const acceptCall = useCallback(async () => {
    if (!incomingCall) return;
    const stream = await getLocalStream();

    const peer = new Peer({
      initiator: false,
      trickle: true,
      stream,
      config: { iceServers: ICE_SERVERS },
    });

    peer.on("signal", (answer) => {
      socket.emit("answer-call", { toUserId: incomingCall.fromUserId, answer });
    });

    peer.on("stream", (remoteStream) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
      setCallStatus("connected");
    });

    peer.on("close", () => endCall());
    peer.on("error", () => endCall());

    peer.signal(incomingCall.offer);
    peerRef.current = peer;
    setIncomingCall(null);
  }, [incomingCall]);

  const rejectCall = useCallback(() => {
    if (incomingCall) {
      socket.emit("reject-call", { toUserId: incomingCall.fromUserId });
    }
    setIncomingCall(null);
    setCallStatus("idle");
  }, [incomingCall]);

  const endCall = useCallback(() => {
    if (otherUserIdRef.current) {
      socket.emit("end-call", { toUserId: otherUserIdRef.current });
    }
    peerRef.current?.destroy();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    otherUserIdRef.current = null;
    setCallStatus("idle");
  }, []);

  useEffect(() => {
    listenForIncomingCalls();
    return () => {
      socket.off("incoming-call");
      socket.off("call-ended");
      socket.off("call-rejected");
    };
  }, [listenForIncomingCalls]);

  return {
    callStatus,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    callUser,
    acceptCall,
    rejectCall,
    endCall,
    listenForIncomingCalls,
  };
};
