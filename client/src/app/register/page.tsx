"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail01, Lock01, User01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useAuth } from "@/providers/auth-provider";

export default function RegisterPage() {
    const router = useRouter();
    const { register, error, clearError, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        display_name: "",
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        setIsSubmitting(true);

        try {
            await register(formData);
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
                        Create your account
                    </h1>
                    <p className="mt-2 text-md text-tertiary">
                        Create an account. Rest assured, our premium cream cheese palette is 100% lactose-free for theoretical physicists (but not for experimentalists named Leonard).
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
                        label="Display Name"
                        placeholder="Dr. Sheldon Cooper"
                        icon={User01}
                        value={formData.display_name}
                        onChange={(val) => setFormData((prev) => ({ ...prev, display_name: val }))}
                    />

                    <Input
                        label="Username"
                        placeholder="sheldon_cooper"
                        icon={User01}
                        isRequired
                        value={formData.username}
                        onChange={(val) => setFormData((prev) => ({ ...prev, username: val }))}
                    />

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
                        placeholder="At least 8 characters"
                        type="password"
                        icon={Lock01}
                        isRequired
                        value={formData.password}
                        onChange={(val) => setFormData((prev) => ({ ...prev, password: val }))}
                        hint="Minimum 8 characters. Make it stronger than your grasp of physics."
                    />

                    <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        className="w-full"
                        isDisabled={isSubmitting || isLoading}
                        isLoading={isSubmitting}
                    >
                        Create Account
                    </Button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-tertiary">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-brand-secondary hover:text-brand-secondary_hover"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
