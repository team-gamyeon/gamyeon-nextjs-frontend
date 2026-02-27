"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/featured/auth/store";

export function useLoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    router.push("/dashboard");
  };

  const handleSocialLogin = () => {
    login();
    router.push("/dashboard");
  };

  return {
    showPassword,
    setShowPassword,
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    handleSocialLogin,
  };
}
