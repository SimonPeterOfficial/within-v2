import type { Metadata } from "next";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password — WithIn",
  description: "Gently find your way back in.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout>
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}
