import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi, type OnboardingData } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

// Simple Sheldon commentary generator based on input
function getSheldonComment(step: number, data: Partial<OnboardingData>) {
  if (step === 1) {
    return "Ah, a fresh intellect! Let's confirm your illustrious name, shall we?";
  }
  if (step === 2) {
    const age = data.age;
    if (age && age < 18) return "You're quite younger than my PhD, but enthusiasm is commendable.";
    if (age && age > 65) return "A seasoned mind! Hopefully you still remember Schrödinger's cat.";
    return "Age is just a number, much like the countless equations I enjoy.";
  }
  if (step === 3) {
    return "Occupation? Please specify, so I may gauge your intellectual baseline.";
  }
  if (step === 4) {
    return "Lastly, why venture into de_cooper.ai? I hope for scholarly ambition, not mere curiosity.";
  }
  return "";
}

export function OnboardingWizard({ onClose }: { onClose: () => void }) {
  const { token, user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OnboardingData>({
    display_name: user?.display_name || "",
    age: 25,
    occupation: "",
    onboarding_reason: "",
  });
  const [error, setError] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "age" ? Number(value) : value }));
  };

  const submit = async () => {
    if (!token) return;
    try {
      const updated = await authApi.submitOnboarding(form, token);
      updateUser(updated);
      onClose();
    } catch (e: any) {
      setError(e?.detail || "Failed to submit onboarding");
    }
  };

  // Glassmorphic container styles (Tailwind)
  const containerClass = "fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50";
  const panelClass = "bg-white/10 backdrop-filter backdrop-blur-xl rounded-xl shadow-xl p-8 w-96 max-w-full border border-white/20";

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={panelClass}
      >
        <h2 className="text-2xl font-bold text-primary mb-4">Welcome, {form.display_name || "Friend"}</h2>
        <p className="text-tertiary mb-4 italic">{getSheldonComment(step, form)}</p>
        <AnimatePresence exitBeforeEnter>
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
            >
              <label className="block text-sm font-medium text-primary mb-2">Display Name</label>
              <input
                type="text"
                name="display_name"
                value={form.display_name}
                onChange={handleChange}
                className="w-full rounded-md bg-white/20 border border-white/30 text-primary p-2 mb-4"
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
            >
              <label className="block text-sm font-medium text-primary mb-2">Age</label>
              <input
                type="number"
                name="age"
                min="1"
                max="120"
                value={form.age}
                onChange={handleChange}
                className="w-full rounded-md bg-white/20 border border-white/30 text-primary p-2 mb-4"
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
            >
              <label className="block text-sm font-medium text-primary mb-2">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="w-full rounded-md bg-white/20 border border-white/30 text-primary p-2 mb-4"
              />
            </motion.div>
          )}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
            >
              <label className="block text-sm font-medium text-primary mb-2">Why are you using de_cooper.ai?</label>
              <textarea
                name="onboarding_reason"
                value={form.onboarding_reason}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md bg-white/20 border border-white/30 text-primary p-2 mb-4"
              />
            </motion.div>
          )}
        </AnimatePresence>
        {error && <p className="text-red-400 mb-2">{error}</p>}
        <div className="flex justify-between mt-4">
          {step > 1 && (
            <button onClick={prev} className="px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30">
              Back
            </button>
          )}
          {step < 4 && (
            <button onClick={next} className="ml-auto px-4 py-2 bg-brand-primary text-fg-brand-primary rounded-md hover:bg-brand-primary/80">
              Next
            </button>
          )}
          {step === 4 && (
            <button onClick={submit} className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500">
              Finish
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
