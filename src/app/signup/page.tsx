import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up — WithIn",
  description: "Start your story inside the universe within.",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}
