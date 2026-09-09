"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(
    searchParams.get("error") === "unauthorized"
      ? "Esta cuenta no tiene acceso al centro de control."
      : "",
  );
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/admin",
      redirect: false,
    });

    if (!result || result.error) {
      setMessage(
        "No pudimos ingresar. Revisa la contraseña y confirma que la cuenta sea administradora.",
      );
      setPending(false);
      return;
    }

    window.location.assign(result.url || "/admin");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef3f7] px-4 py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#00569d]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />

      <section className="control-enter relative grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-300/30 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-[#002f5a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -right-8 top-32 h-40 w-40 rounded-full border border-white/10" />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black text-[#003d73]">
              IDC
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-sky-200/70">
              Centro privado
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">
              Todo el control,
              <br />
              sin complicaciones.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/60">
              Administra el aula, el contenido, la radio y las transmisiones en
              vivo desde un ambiente separado del sitio público.
            </p>
          </div>
          <div className="relative flex items-center gap-2 text-xs font-semibold text-white/55">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Acceso exclusivo para el equipo autorizado
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#003d73] text-xs font-black text-white">
              IDC
            </span>
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#00569d] lg:mt-0">
            IDC Huancayo Control
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Iniciar sesión
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Usa la misma cuenta administradora del aula virtual.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block text-sm font-bold text-slate-700">
              Correo administrativo
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                placeholder="nombre@idchuancayo.org"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none transition focus:border-[#00569d] focus:ring-4 focus:ring-[#00569d]/10"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Contraseña
              <span className="relative mt-2 block">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Tu contraseña"
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-20 text-sm font-normal outline-none transition focus:border-[#00569d] focus:ring-4 focus:ring-[#00569d]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-3 text-[11px] font-bold text-[#00569d] hover:bg-sky-50"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </span>
            </label>

            {message && (
              <p
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#00569d] px-5 text-sm font-extrabold text-white shadow-lg shadow-[#00569d]/15 transition hover:-translate-y-0.5 hover:bg-[#004780] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {pending ? "Verificando acceso…" : "Entrar al centro de control"}
            </button>
          </form>

          <p className="mt-7 text-center text-[11px] leading-5 text-slate-400">
            No existe registro público. Los accesos se administran desde
            Supabase y requieren rol de administrador.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
