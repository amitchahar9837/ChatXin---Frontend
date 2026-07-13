import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { updateProfile } from "../redux/slices/authSlice";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { authUser, isUpdatingProfile } = useSelector((state) => state.auth);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {};
    if (fullName !== authUser.fullName) payload.fullName = fullName;
    if (bio !== authUser.bio) payload.bio = bio;
    if (preview) payload.profilePic = preview;
    if (Object.keys(payload).length === 0) return;
    dispatch(updateProfile(payload));
    setPreview(null);
  };

  return (
    <div className="min-h-screen bg-ink text-ink-text px-6 py-8">
      <div className="max-w-md mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-ink-text mb-6">
          <ArrowLeft size={18} />
          <span className="text-sm">Back to chats</span>
        </Link>

        <h1 className="font-display font-bold text-2xl mb-6">Your profile</h1>

        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="relative">
            <Avatar src={preview || authUser?.profilePic} name={authUser?.fullName} size="lg" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-marigold text-ink p-1.5 rounded-full"
            >
              <Camera size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageSelect} />
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <Button type="submit" disabled={isUpdatingProfile} className="mt-2">
            {isUpdatingProfile ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
