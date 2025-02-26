import { AuthForm } from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication</h1>
      <AuthForm />
    </div>
  );
}
