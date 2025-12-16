import { EmailForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-200 p-4 font-sans selection:bg-blue-500/30">
      <EmailForm />
    </div>
  );
}
