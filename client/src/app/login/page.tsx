"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail01, Lock01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
    const router = useRouter();
    const { login, error, clearError, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        setIsSubmitting(true);

        try {
            await login(formData);
            router.push("/learn");
        } catch {
            // Error is handled by auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-dvh items-center justify-center bg-primary px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="font-logo text-3xl font-extrabold text-fg-brand-primary tracking-tight mb-3">
                        de_cooper.ai
                    </div>
                    <h1 className="font-display text-display-sm font-bold text-primary">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-md text-tertiary">
                        Sign in to continue your education. Rendered in full lactose-rich cream cheese white—much to Leonard&apos;s gastrointestinal horror.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-lg border border-error_subtle bg-error-primary px-4 py-3 text-sm text-error-primary">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        placeholder="sheldon@caltech.edu"
                        type="email"
                        icon={Mail01}
                        isRequired
                        value={formData.email}
                        onChange={(val) => setFormData((prev) => ({ ...prev, email: val }))}
                    />

                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        type="password"
                        icon={Lock01}
                        isRequired
                        value={formData.password}
                        onChange={(val) => setFormData((prev) => ({ ...prev, password: val }))}
                    />

                    <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        className="w-full"
                        isDisabled={isSubmitting || isLoading}
                        isLoading={isSubmitting}
                    >
                        Sign In
                    </Button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-tertiary">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-brand-secondary hover:text-brand-secondary_hover"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
