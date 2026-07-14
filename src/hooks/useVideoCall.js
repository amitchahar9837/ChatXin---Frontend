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
  const socketRef = useRef(null); // 👈 ab ref me rakho, top-level const nahi

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const callUser = useCallback(
    async (toUserId, callerInfo) => {
      const socket = socketRef.current || getSocket();
      if (!socket) {
        console.log("⚠️ Socket not ready, cannot start call");
        return;
      }
      otherUserIdRef.current = toUserId;
      const stream = await getLocalStream();
      setCallStatus("calling");

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: { iceServers: ICE_SERVERS },
      });

      peer.on("signal", (offer) => {
        socket.emit("call-user", {
          toUserId,
          offer,
          fromUserId: myUserId,
          callerInfo,
        });
      });

      peer.on("stream", (remoteStream) => {
        if (remoteVideoRef.current)
          remoteVideoRef.current.srcObject = remoteStream;
        setCallStatus("connected");
      });

      peer.on("close", () => endCall());
      peer.on("error", () => endCall());

      peerRef.current = peer;

      socket.once("call-accepted", ({ answer }) => {
        peer.signal(answer);
      });

      socket.on("ice-candidate", ({ candidate }) => {
        if (candidate) peer.signal(candidate);
      });
    },
    [myUserId],
  );

  const acceptCall = useCallback(async () => {
    const socket = socketRef.current || getSocket();
    if (!incomingCall || !socket) return;
    const stream = await getLocalStream();

    const peer = new Peer({
      initiator: false,
      trickle: false,
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
    const socket = socketRef.current || getSocket();
    if (incomingCall && socket) {
      socket.emit("reject-call", { toUserId: incomingCall.fromUserId });
    }
    setIncomingCall(null);
    setCallStatus("idle");
  }, [incomingCall]);

  const endCall = useCallback(() => {
    const socket = socketRef.current || getSocket();
    if (otherUserIdRef.current && socket) {
      socket.emit("end-call", { toUserId: otherUserIdRef.current });
    }
    peerRef.current?.destroy();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    otherUserIdRef.current = null;
    setCallStatus("idle");
  }, []);

  // 👇 YAHI wo naya useEffect hai jo poll karta hai jab tak socket ban na jaaye
  useEffect(() => {
    let interval;
    let attached = false;

    const trySetup = () => {
      const s = getSocket();
      if (s?.id && !attached) {
        console.log("socket:", s);
        console.log("attached:", attached);
        socketRef.current = s;
        console.log("✅ Socket found, attaching listeners", s.id);

        s.on("incoming-call", ({ fromUserId, offer, callerInfo }) => {
          console.log("📥 incoming-call RECEIVED:", fromUserId);
          setIncomingCall({ fromUserId, offer, callerInfo });
          setCallStatus("ringing");
          otherUserIdRef.current = fromUserId;
        });

        s.on("call-ended", () => endCall());
        s.on("call-rejected", () => endCall());

        attached = true;
        clearInterval(interval);
      } else if (!s) {
        console.log("⏳ Socket not ready yet, retrying...");
      }
    };

    trySetup();
    interval = setInterval(trySetup, 500);

    return () => {
      clearInterval(interval);
      const s = socketRef.current;
      if (s) {
        s.off("incoming-call");
        s.off("call-ended");
        s.off("call-rejected");
      }
    };
  }, [myUserId]);

  return {
    callStatus,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    callUser,
    acceptCall,
    rejectCall,
    endCall,
  };
};
