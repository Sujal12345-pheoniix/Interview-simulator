import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50/50">
      <SignUp />
    </div>
  );
}
