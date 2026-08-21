import type { Metadata } from "next";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create your account — WithIn",
  description: "Create your place Within. A universe built around how you feel.",
};

export default function SignupPage() {
  return (
    <AuthSplitLayout>
      <SignupForm />
    </AuthSplitLayout>
  );
}
