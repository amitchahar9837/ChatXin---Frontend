import { createContext, useContext } from "react";
import { useSelector } from "react-redux";
import { useVideoCall } from "../../hooks/useVideoCall";

const VideoCallContext = createContext(null);

export const VideoCallProvider = ({ children }) => {
  const { authUser } = useSelector((state) => state.auth);
  const videoCall = useVideoCall(authUser?._id);

  return (
    <VideoCallContext.Provider value={videoCall}>
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCallContext = () => useContext(VideoCallContext);
