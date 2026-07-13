import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { MessageCircle } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { login, signup } from "../redux/slices/authSlice";

const signupSchema = z.object({
  fullName: z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "At most 30 characters")
    .regex(/^[a-zA-Z ]+$/, "Only letters allowed"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(6, "At least 6 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
      "Must include a letter and a number",
    ),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const dispatch = useDispatch();
  const { isLoggingIn, isSigningUp } = useSelector((state) => state.auth);
  const isSignup = mode === "signup";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(isSignup ? signupSchema : loginSchema) });

  const onSubmit = (data) => {
    dispatch(isSignup ? signup(data) : login(data));
  };

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    reset();
  };

  return (
    <div className="min-h-screen flex bg-ink text-ink-text">
      {/* Left — brand hero, hidden on mobile */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center gap-1 bg-surface px-12">
        {/* <div className="w-16 h-16 rounded-2xl bg-marigold flex items-center justify-center">
          <MessageCircle size={32} className="text-ink" />
        </div> */}
        <div className="w-28 h-fit">
          <img src="/favicon_2.png" alt="logo_favicon" loading="lazy" />
        </div>
        <div className="w-32 h-fit">
          <img src="/logo2.png" alt="logo" loading="lazy" />
        </div>
        <p className="text-muted text-center max-w-sm mt-6">
          Real conversations, real time. Simple, fast, and made for staying
          close.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-16">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="font-display font-bold text-2xl mb-1">
            {isSignup ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-muted text-sm mb-6">
            {isSignup
              ? "Start chatting in a minute"
              : "Log in to continue chatting"}
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {isSignup && (
              <Input
                label="Full name"
                placeholder="Your name"
                error={errors.fullName?.message}
                {...register("fullName")}
              />
            )}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
              className="mt-2"
              disabled={isLoggingIn || isSigningUp}
            >
              {isSignup
                ? isSigningUp
                  ? "Creating account..."
                  : "Sign up"
                : isLoggingIn
                  ? "Logging in..."
                  : "Log in"}
            </Button>
          </form>

          <p className="text-sm text-muted text-center mt-6">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={switchMode}
              className="text-teal font-medium hover:underline"
            >
              {isSignup ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
