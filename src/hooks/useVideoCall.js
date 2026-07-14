import { useState, useRef, useCallback, useEffect } from "react";
import Peer from "simple-peer";
import { getSocket } from "../lib/socket";
import { axiosInstance } from "../lib/axiosInstance";

export const useVideoCall = (myUserId) => {
  const [callStatus, setCallStatus] = useState("idle");
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null); // 👈 state, ref nahi
  const [remoteStream, setRemoteStream] = useState(null); // 👈 state, ref nahi

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const otherUserIdRef = useRef(null);
  const socketRef = useRef(null);

  const getIceServers = async () => {
    try {
      const res = await axiosInstance.get("/turn-credentials");
      return [{ urls: "stun:stun.l.google.com:19302" }, ...res.data];
    } catch {
      return [{ urls: "stun:stun.l.google.com:19302" }];
    }
  };

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    setLocalStream(stream); // 👈 state update — video tag mount hote hi effect isse pakad lega
    return stream;
  };

  const callUser = useCallback(
    async (toUserId, callerInfo) => {
      const socket = socketRef.current || getSocket();
      if (!socket) return;

      otherUserIdRef.current = toUserId;
      setCallStatus("calling"); // 👈 pehle status set karo taaki video tag mount ho jaaye
      const stream = await getLocalStream();
      const iceServers = await getIceServers();

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: { iceServers },
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
        setRemoteStream(remoteStream); // 👈 state update
        setCallStatus("connected");
      });

      peer.on("close", () => endCall());
      peer.on("error", () => endCall());

      peerRef.current = peer;

      socket.once("call-accepted", ({ answer }) => {
        peer.signal(answer);
      });
    },
    [myUserId],
  );

  const acceptCall = useCallback(async () => {
    const socket = socketRef.current || getSocket();
    if (!incomingCall || !socket) return;

    setCallStatus("connecting"); // 👈 naya status, video tag ko mount karne ke liye
    const stream = await getLocalStream();
    const iceServers = await getIceServers();

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: { iceServers },
    });

    peer.on("signal", (answer) => {
      socket.emit("answer-call", { toUserId: incomingCall.fromUserId, answer });
    });

    peer.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream);
      setCallStatus("connected");
    });

    peer.on("close", () => endCall());
    peer.on("error", () => endCall());

    peer.signal(incomingCall.offer);
    peerRef.current = peer;
    otherUserIdRef.current = incomingCall.fromUserId;
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
    setLocalStream(null);
    setRemoteStream(null);
    otherUserIdRef.current = null;
    setCallStatus("idle");
  }, []);

  // 👇 socket ready hote hi listeners attach karo
  useEffect(() => {
    let interval;
    let attached = false;

    const trySetup = () => {
      const s = getSocket();
      if (s && !attached) {
        socketRef.current = s;
        s.on("incoming-call", ({ fromUserId, offer, callerInfo }) => {
          setIncomingCall({ fromUserId, offer, callerInfo });
          setCallStatus("ringing");
          otherUserIdRef.current = fromUserId;
        });
        s.on("call-ended", () => endCall());
        s.on("call-rejected", () => endCall());
        attached = true;
        clearInterval(interval);
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

  // 👇 YAHI ASLI FIX — jab bhi local stream state ya video ref badle, srcObject dobara set karo
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]); // callStatus dependency isliye taaki jab video tag mount ho (re-render ke baad), effect dobara chale

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callStatus]);

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
