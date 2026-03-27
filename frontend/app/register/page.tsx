import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h1 className="mb-2 text-2xl font-bold">Create account</h1>
        <p className="mb-6 text-sm text-slate-600">Join the forum and start sharing with the community.</p>
        <RegisterForm />
      </section>
    </main>
  );
}
