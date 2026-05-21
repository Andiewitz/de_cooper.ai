"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, User01, Briefcase01, MessageChatCircle } from "@untitledui/icons";
import { authApi, type OnboardingData } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { cx } from "@/utils/cx";

const STEPS = [
    { id: 1, title: "Profile", hint: "What should we call you?" },
    { id: 2, title: "About you", hint: "Help calibrate difficulty" },
    { id: 3, title: "Background", hint: "Your day-to-day context" },
    { id: 4, title: "Goals", hint: "Why you're here" },
] as const;

function getSheldonComment(step: number, data: Partial<OnboardingData>) {
    if (step === 1) {
        return "Ah, a fresh intellect. Let's confirm your illustrious name, shall we?";
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState<OnboardingData>({
        display_name: user?.display_name || "",
        age: 25,
        occupation: "",
        onboarding_reason: "",
    });
    const [error, setError] = useState<string | null>(null);

    const progress = (step / STEPS.length) * 100;

    const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
    const prev = () => setStep((s) => Math.max(s - 1, 1));

    const canContinue = () => {
        if (step === 1) return form.display_name.trim().length > 0;
        if (step === 2) return form.age >= 1 && form.age <= 120;
        if (step === 3) return form.occupation.trim().length > 0;
        if (step === 4) return form.onboarding_reason.trim().length > 0;
        return false;
    };

    const submit = async () => {
        if (!token) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const updated = await authApi.submitOnboarding(form, token);
            updateUser(updated);
            onClose();
        } catch (e: unknown) {
            const detail = e && typeof e === "object" && "detail" in e ? String((e as { detail: unknown }).detail) : null;
            setError(detail || "Failed to submit onboarding");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-dvh bg-secondary">
            {/* Brand panel */}
            <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-brand-section p-10 lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(254,240,138,0.15),transparent_50%)]" />
                <div className="relative">
                    <p className="font-logo text-sm font-black uppercase tracking-wider text-primary_on-brand">COOPER.AI</p>
                    <h1 className="mt-6 font-display text-display-sm font-bold text-primary_on-brand">
                        Set up your learning profile
                    </h1>
                    <p className="mt-3 max-w-sm text-md text-tertiary_on-brand">
                        A quick calibration so Dr. Cooper can tailor explanations to your level — without lowering standards.
                    </p>
                </div>

                <ol className="relative space-y-4">
                    {STEPS.map((s) => (
                        <li
                            key={s.id}
                            className={cx(
                                "flex items-center gap-3 rounded-lg border px-4 py-3 transition duration-100",
                                step === s.id
                                    ? "border-brand bg-primary/10"
                                    : step > s.id
                                      ? "border-brand/40 bg-primary/5"
                                      : "border-secondary/30 bg-transparent",
                            )}
                        >
                            <span
                                className={cx(
                                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                                    step > s.id
                                        ? "bg-brand-solid text-white"
                                        : step === s.id
                                          ? "bg-brand-primary text-brand-primary"
                                          : "bg-primary/20 text-tertiary_on-brand",
                                )}
                            >
                                {step > s.id ? <Check className="size-4" /> : s.id}
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-primary_on-brand">{s.title}</p>
                                <p className="text-xs text-tertiary_on-brand">{s.hint}</p>
                            </div>
                        </li>
                    ))}
                </ol>

                <p className="relative text-xs text-quaternary_on-brand">Step {step} of {STEPS.length}</p>
            </div>

            {/* Form panel */}
            <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
                <div className="mx-auto w-full max-w-lg">
                    <div className="mb-8 lg:hidden">
                        <p className="font-logo text-xs font-black uppercase tracking-wider text-brand-secondary">COOPER.AI</p>
                        <div className="mt-4 flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-secondary">
                                Step {step} of {STEPS.length}
                            </span>
                            <span className="text-sm text-tertiary">{STEPS[step - 1]?.title}</span>
                        </div>
                        <ProgressBar value={progress} className="mt-3" progressClassName="bg-brand-solid" />
                    </div>

                    <div className="rounded-2xl border border-secondary bg-primary p-6 shadow-xs sm:p-8">
                        <div className="mb-6 flex items-start gap-4">
                            <FeaturedIcon
                                icon={step === 1 ? User01 : step === 3 ? Briefcase01 : MessageChatCircle}
                                color="brand"
                                theme="light"
                                size="md"
                            />
                            <div>
                                <h2 className="font-display text-display-xs font-semibold text-primary">
                                    {STEPS[step - 1]?.title}
                                </h2>
                                <p className="mt-1 text-sm italic text-tertiary">{getSheldonComment(step, form)}</p>
                            </div>
                        </div>

                        <div className="mb-6 hidden lg:block">
                            <ProgressBar value={progress} className="h-1.5" progressClassName="bg-brand-solid" />
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    className="space-y-4"
                                >
                                    <Input
                                        label="Display name"
                                        placeholder="How should we address you?"
                                        value={form.display_name}
                                        onChange={(value) => setForm((f) => ({ ...f, display_name: value }))}
                                        isRequired
                                    />
                                </motion.div>
                            )}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    className="space-y-4"
                                >
                                    <Input
                                        label="Age"
                                        type="number"
                                        placeholder="25"
                                        value={String(form.age)}
                                        onChange={(value) => setForm((f) => ({ ...f, age: Number(value) || 0 }))}
                                        hint="Used to calibrate explanation depth — not for judgment. Mostly."
                                        isRequired
                                    />
                                </motion.div>
                            )}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    className="space-y-4"
                                >
                                    <Input
                                        label="Occupation"
                                        placeholder="Student, engineer, curious human..."
                                        value={form.occupation}
                                        onChange={(value) => setForm((f) => ({ ...f, occupation: value }))}
                                        isRequired
                                    />
                                </motion.div>
                            )}
                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    className="space-y-4"
                                >
                                    <TextArea
                                        label="Why are you using de_cooper.ai?"
                                        placeholder="Exam prep, curiosity, proving a point to a friend..."
                                        rows={4}
                                        value={form.onboarding_reason}
                                        onChange={(value) => setForm((f) => ({ ...f, onboarding_reason: value }))}
                                        isRequired
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && <p className="mt-4 text-sm text-error-primary">{error}</p>}

                        <div className="mt-8 flex items-center justify-between gap-3 border-t border-secondary pt-6">
                            {step > 1 ? (
                                <Button color="secondary" size="md" iconLeading={ArrowLeft} onClick={prev}>
                                    Back
                                </Button>
                            ) : (
                                <span />
                            )}
                            {step < STEPS.length ? (
                                <Button
                                    color="primary"
                                    size="md"
                                    iconTrailing={ArrowRight}
                                    isDisabled={!canContinue()}
                                    onClick={next}
                                >
                                    Continue
                                </Button>
                            ) : (
                                <Button
                                    color="primary"
                                    size="md"
                                    iconLeading={Check}
                                    isDisabled={!canContinue()}
                                    isLoading={isSubmitting}
                                    onClick={submit}
                                >
                                    Finish setup
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OnboardingWizard;
