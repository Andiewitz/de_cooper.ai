"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail01, Lock01, XClose } from "@untitledui/icons";
import { useAuth } from "@/providers/auth-provider";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { cx } from "@/utils/cx";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: Record<string, unknown>) => void;
                    renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
                    prompt: (callback?: (notification: { isNotDisplayed: () => boolean; getNotDisplayedReason: () => string }) => void) => void;
                };
            };
        };
    }
}

interface AuthModalProps {
    isOpen: boolean;
    initialMode: "login" | "register";
    onClose: () => void;
}

function deriveUsername(email: string): string {
    let base = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_-]/g, "_") ?? "user";
    if (base.length < 3) {
        base = `${base}_cooper`;
    }
    return base.slice(0, 100);
}

const DEMO_GOOGLE_EMAIL = "gracefulandrei@gmail.com";
const DEMO_GOOGLE_PASSWORD = "SecurePassword123!";

export function AuthModal({ isOpen, initialMode, onClose }: AuthModalProps) {
    const router = useRouter();
    const { login, register, googleLogin, error, clearError, isLoading } = useAuth();
    const [mode, setMode] = useState<"login" | "register">(initialMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const isBusy = isSubmitting || isLoading;

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            clearError();
        }
    }, [isOpen, initialMode, clearError]);

    const handleGoogleCredential = useCallback(
        async (credential: string) => {
            setIsSubmitting(true);
            clearError();
            try {
                await googleLogin(credential);
                onClose();
                router.push("/learn");
            } catch {
                // Error surfaced via auth context
            } finally {
                setIsSubmitting(false);
            }
        },
        [clearError, googleLogin, onClose, router],
    );

    useEffect(() => {
        if (!googleClientId || !isOpen) return;

        const initGoogleAuth = () => {
            if (typeof window === "undefined" || !window.google?.accounts?.id) return;

            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: (response: { credential?: string }) => {
                    if (response.credential) {
                        void handleGoogleCredential(response.credential);
                    }
                },
                auto_select: false,
            });

            const btnContainer = document.getElementById("google-signin-btn");
            if (btnContainer) {
                btnContainer.innerHTML = "";
                window.google.accounts.id.renderButton(btnContainer, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    text: mode === "register" ? "signup_with" : "continue_with",
                    shape: "rectangular",
                    logo_alignment: "left",
                    width: btnContainer.offsetWidth || 356,
                });
            }

            if (mode === "login") {
                window.google.accounts.id.prompt();
            }
        };

        if (window.google?.accounts?.id) {
            const timer = setTimeout(initGoogleAuth, 150);
            return () => clearTimeout(timer);
        }

        const existing = document.getElementById("google-gsi-client");
        if (existing) {
            existing.addEventListener("load", initGoogleAuth);
            return () => existing.removeEventListener("load", initGoogleAuth);
        }

        const script = document.createElement("script");
        script.id = "google-gsi-client";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogleAuth;
        document.body.appendChild(script);
    }, [googleClientId, handleGoogleCredential, isOpen, mode]);

    const handleDemoGoogle = async () => {
        setEmail(DEMO_GOOGLE_EMAIL);
        setPassword(DEMO_GOOGLE_PASSWORD);
        setIsSubmitting(true);
        clearError();
        try {
            await login({ email: DEMO_GOOGLE_EMAIL, password: DEMO_GOOGLE_PASSWORD });
            onClose();
            router.push("/learn");
        } catch {
            // Error surfaced via auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        setIsSubmitting(true);

        try {
            if (mode === "login") {
                await login({ email, password });
            } else {
                await register({
                    email,
                    password,
                    username: deriveUsername(email),
                });
            }
            onClose();
            router.push("/learn");
        } catch {
            // Error surfaced via auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    const switchMode = (next: "login" | "register") => {
        setMode(next);
        clearError();
    };

    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            isDismissable
        >
            <Modal className="max-w-[440px]">
                <Dialog className="outline-hidden">
                    <div className="relative w-full rounded-2xl border border-secondary bg-primary p-6 shadow-xl sm:p-8">
                        <Button
                            color="tertiary"
                            size="sm"
                            className="absolute top-4 right-4"
                            aria-label="Close"
                            onClick={onClose}
                            iconLeading={XClose}
                        />

                        <div className="mb-6 flex justify-center pt-2">
                            <BadgeWithDot color="brand" type="modern" size="md">
                                {mode === "login" ? "Sign in to your account" : "Enroll in the academy"}
                            </BadgeWithDot>
                        </div>

                        <div className="mb-6 text-center">
                            <h1 className="font-display text-display-xs font-semibold text-primary">
                                {mode === "login" ? "Welcome back" : "Create your account"}
                            </h1>
                            <p className="mt-2 text-sm text-tertiary">
                                {mode === "login"
                                    ? "Access your learning workspace and personalized study tracks."
                                    : "Start your tailored study plan with Dr. Cooper as your (reluctant) guide."}
                            </p>
                        </div>

                        <div className="mb-5">
                            {googleClientId ? (
                                <div id="google-signin-btn" className="flex min-h-11 w-full justify-center" />
                            ) : (
                                <SocialButton
                                    social="google"
                                    theme="brand"
                                    size="lg"
                                    className="w-full"
                                    disabled={isBusy}
                                    onClick={() => void handleDemoGoogle()}
                                >
                                    Continue with Google
                                </SocialButton>
                            )}
                        </div>

                        <div className="mb-5 flex items-center gap-3">
                            <div className="h-px flex-1 bg-border-secondary" />
                            <span className="text-xs font-medium text-quaternary">or</span>
                            <div className="h-px flex-1 bg-border-secondary" />
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mb-4 rounded-lg border border-error_subtle bg-error-primary px-3 py-2.5 text-sm text-error-primary"
                            >
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                icon={Mail01}
                                value={email}
                                onChange={setEmail}
                                isRequired
                                isDisabled={isBusy}
                                autoComplete="email"
                            />

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"}
                                icon={Lock01}
                                value={password}
                                onChange={setPassword}
                                isRequired
                                isDisabled={isBusy}
                                autoComplete={mode === "register" ? "new-password" : "current-password"}
                            />

                            {mode === "register" && (
                                <p className="rounded-lg border border-secondary bg-secondary px-3 py-2.5 text-xs text-tertiary">
                                    Use 8+ characters with letters and numbers. Your display name is set during onboarding.
                                </p>
                            )}

                            <Button
                                type="submit"
                                color="primary"
                                size="lg"
                                className="w-full"
                                isDisabled={isBusy}
                                isLoading={isBusy}
                                showTextWhileLoading
                            >
                                {mode === "login" ? "Sign in" : "Create account"}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-tertiary">
                            {mode === "login" ? (
                                <>
                                    No account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => switchMode("register")}
                                        className={cx(
                                            "font-semibold text-brand-secondary hover:text-brand-secondary_hover",
                                            "underline underline-offset-4 transition duration-100",
                                        )}
                                    >
                                        Create one
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => switchMode("login")}
                                        className={cx(
                                            "font-semibold text-brand-secondary hover:text-brand-secondary_hover",
                                            "underline underline-offset-4 transition duration-100",
                                        )}
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
