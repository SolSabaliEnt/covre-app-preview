import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { BadgeCheck, CheckCircle2, MapPin, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { cn } from "./ui/utils"
import { CovreBrandLogo } from "./CovreBrandLogo"
import { APP_NAME } from "../lib/brand"
import { signInWorkerWithEmail, signUpWorkerWithEmail } from "../auth/supabaseWorkerAuth"

type Mode = "signup" | "signin"

const benefits = [
  "See shift details and site context before you commit",
  "Build a reusable credential and work-history profile",
  "Surface familiar sites and repeat opportunities over time",
]

export function WorkerAuthForm() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>("signin")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    if (!email.trim()) {
      toast.error("Email is required.")
      return false
    }
    if (password.length < 6) {
      toast.error("Password should be at least 6 characters.")
      return false
    }
    if (mode === "signup" && !fullName.trim()) {
      toast.error("Full name is required to create an account.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const payload = {
        email: email.trim(),
        password,
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      }

      const result =
        mode === "signup"
          ? await signUpWorkerWithEmail(payload)
          : await signInWorkerWithEmail(payload)

      if (!result.ok) {
        toast.error(result.error.message)
        return
      }

      if (result.data.sessionEstablished) {
        toast.success(result.data.message)
        navigate("/worker/onboarding", { replace: true })
        return
      }

      toast.success(result.data.message, { duration: 8000 })
      if (mode === "signup") {
        setMode("signin")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full overflow-hidden rounded-[1.75rem] border-[#DDE7E8] bg-white shadow-[0_24px_70px_rgba(19,51,79,0.10)]">
      <CardHeader className="items-center space-y-4 border-b border-[#EEF4F5] bg-gradient-to-b from-[#F7FAFA] to-white px-6 pb-6 pt-7 text-center sm:px-8">
        <CovreBrandLogo
          surface="light"
          layout="mark"
          width={60}
          className="mx-auto"
          imgClassName="h-[60px] w-[60px] object-contain"
          alt={APP_NAME}
        />
        <div className="space-y-2">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#E6F6F2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#257665]">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            Care professional access
          </div>
          <CardTitle className="text-2xl font-semibold tracking-[-0.02em] text-[#13334F] sm:text-[1.7rem]">
            {mode === "signup" ? "Find shifts without walking in blind" : "Welcome back"}
          </CardTitle>
          <CardDescription className="mx-auto max-w-sm text-sm leading-6 text-[#607583]">
            {mode === "signup"
              ? "Create your Covre worker account and start building a profile that carries your readiness and work history forward."
              : "Sign in to continue your profile, applications, and booked shifts."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-7 pt-6 sm:px-8">
        <div
          className="flex rounded-xl border border-[#DDE7E8] bg-[#F7FAFA] p-1"
          role="tablist"
          aria-label="Account mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            className={cn(
              "min-h-10 flex-1 rounded-lg px-3 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53B59F]",
              mode === "signin"
                ? "bg-white text-[#13334F] shadow-sm"
                : "text-[#607583] hover:text-[#13334F]",
            )}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={cn(
              "min-h-10 flex-1 rounded-lg px-3 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53B59F]",
              mode === "signup"
                ? "bg-white text-[#13334F] shadow-sm"
                : "text-[#607583] hover:text-[#13334F]",
            )}
            onClick={() => setMode("signup")}
          >
            Create account
          </button>
        </div>

        {mode === "signup" && (
          <div className="rounded-2xl border border-[#E6F6F2] bg-[#F3FBF8] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#13334F]">
              <Sparkles className="h-4 w-4 text-[#257665]" aria-hidden />
              What Covre helps you carry forward
            </div>
            <div className="space-y-2.5">
              {benefits.map(benefit => (
                <div key={benefit} className="flex items-start gap-2.5 text-sm leading-5 text-[#607583]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#257665]" aria-hidden />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="worker-auth-name" className="text-[#13334F]">Full name</Label>
              <Input
                id="worker-auth-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={loading}
                placeholder="Your name"
                className="h-12 rounded-xl border-[#DDE7E8] bg-white"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="worker-auth-email" className="text-[#13334F]">Email</Label>
            <Input
              id="worker-auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              placeholder="you@email.com"
              className="h-12 rounded-xl border-[#DDE7E8] bg-white"
            />
          </div>

          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="worker-auth-phone" className="text-[#13334F]">
                Phone <span className="font-normal text-[#9AAAB3]">(optional)</span>
              </Label>
              <Input
                id="worker-auth-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={loading}
                placeholder="Best number to reach you"
                className="h-12 rounded-xl border-[#DDE7E8] bg-white"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="worker-auth-password" className="text-[#13334F]">Password</Label>
            <Input
              id="worker-auth-password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              minLength={6}
              placeholder="At least 6 characters"
              className="h-12 rounded-xl border-[#DDE7E8] bg-white"
            />
          </div>

          {mode === "signup" ? (
            <div className="flex items-start gap-2.5 rounded-xl bg-[#F7FAFA] px-3.5 py-3 text-xs leading-5 text-[#607583]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#257665]" aria-hidden />
              <span>After signup, you&apos;ll continue into worker onboarding before browsing eligible shifts.</span>
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-[#607583]">
              Return to your worker profile, credentials, shift feed, and bookings.
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#53B59F] text-sm font-semibold text-white shadow-sm hover:bg-[#449a86]"
          >
            {loading
              ? "Please wait…"
              : mode === "signup"
                ? "Create worker profile"
                : "Continue to Covre"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
