"use client";

import { useState } from "react";
import type { SignupFormData } from "@/featured/auth/types";

export function useSignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "이름을 입력해주세요.";
    if (!formData.email) newErrors.email = "이메일을 입력해주세요.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    if (!formData.password) newErrors.password = "비밀번호를 입력해주세요.";
    else if (formData.password.length < 8)
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    if (!agreed) newErrors.agreed = "약관에 동의해주세요.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSuccess(true);
    }
  };

  return {
    showPassword,
    setShowPassword,
    formData,
    updateField,
    agreed,
    setAgreed,
    errors,
    setErrors,
    success,
    handleSubmit,
  };
}
