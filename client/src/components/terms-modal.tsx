"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed inset-x-4 top-[5%] bottom-[5%] z-[101] mx-auto max-w-3xl rounded-2xl border border-secondary bg-primary shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-secondary px-6 py-4 shrink-0">
                            <div>
                                <h2 className="font-logo text-xl font-extrabold text-primary tracking-tight">
                                    Terms &amp; Conditions
                                </h2>
                                <p className="text-[10px] text-tertiary mt-0.5">
                                    Last updated: May 2026
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center size-8 rounded-lg border border-secondary bg-secondary/30 text-tertiary hover:text-primary hover:bg-secondary transition-all text-sm font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-8 text-sm text-secondary leading-relaxed">
                            <section>
                                <h3 className="text-base font-semibold text-primary mb-2">1. Nature of This Project</h3>
                                <p>
                                    de_cooper.ai (&ldquo;the Platform&rdquo;) is a <strong className="text-primary">non-commercial, satirical fan project</strong> created
                                    exclusively for educational and comedic purposes. The Platform employs the persona of a fictional character
                                    as a humorous framing device for AI-assisted learning. It is not a commercial product, does not generate
                                    revenue, and is not offered for sale.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-primary mb-2">2. Parody &amp; Satire Disclaimer</h3>
                                <p>
                                    This Platform constitutes <strong className="text-primary">parody and transformative commentary</strong> under fair use principles
                                    (17 U.S.C. § 107). The character &ldquo;Dr. Sheldon Cooper&rdquo; is a fictional character from the
                                    television series <em>The Big Bang Theory</em>, created by Chuck Lorre and Bill Prady.
                                </p>
                                <p className="mt-3">
                                    All related names, characters, likenesses, and trademarks are the property of their respective owners,
                                    including but not limited to CBS Studios Inc., Warner Bros. Television, and Chuck Lorre Productions.
                                </p>
                                <p className="mt-3">
                                    This Platform is <strong className="text-primary">not affiliated with, endorsed by, sponsored by, or in any way officially
                                    connected with</strong> any of the aforementioned entities, their subsidiaries, or their affiliates.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-primary mb-2">3. No Warranty &amp; Educational Disclaimer</h3>
                                <p>
                                    The educational content provided on this Platform is generated by artificial intelligence and is presented
                                    &ldquo;as is&rdquo; without any warranties, express or implied. The AI-generated responses are for
                                    entertainment and general educational purposes only and should not be relied upon as authoritative
                                    academic instruction.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-primary mb-2">4. User Accounts &amp; Data</h3>
                                <p>
                                    When you create an account, you agree to provide accurate information. We store only the minimum data
                                    required to operate the Platform: your email address, a hashed password, and your conversation history.
                                    We do not sell, share, or distribute your personal data to third parties.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-primary mb-2">5. Acceptable Use</h3>
                                <p>You agree not to use this Platform to:</p>
                                <ul className="mt-2 list-disc list-inside space-y-1 text-tertiary">
                                    <li>Engage in any unlawful, harmful, or abusive activity</li>
                                    <li>Attempt to extract, reverse-engineer, or scrape the AI model</li>
                                    <li>Misrepresent AI-generated content as human-authored academic work</li>
                                    <li>Overload the Platform with automated requests</li>
                                    <li>Use the Platform for any commercial purpose</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-primary mb-2">6. Intellectual Property</h3>
                                <p>
                                    The original code, design, and user interface of this Platform are the work of its creator(s). The
                                    satirical persona, character references, and associated trademarks belong to their respective rights
                                    holders as noted in Section 2. If you are a rights holder with concerns, please contact us.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-primary mb-2">7. Limitation of Liability</h3>
                                <p>
                                    To the fullest extent permitted by applicable law, the creators of this Platform shall not be liable
                                    for any indirect, incidental, special, consequential, or punitive damages arising out of or relating
                                    to your use of the Platform.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-primary mb-2">8. Contact</h3>
                                <p>
                                    For any questions, concerns, or takedown requests regarding this Platform, please open an issue on
                                    the project&apos;s GitHub repository or contact the project maintainer directly.
                                </p>
                            </section>

                            {/* Sheldon sign-off */}
                            <div className="rounded-xl border border-secondary bg-secondary/30 p-5 text-center">
                                <p className="text-xs italic text-tertiary">
                                    &ldquo;I would say I&apos;m sorry, but I was right. And that feels better than being sorry.&rdquo;
                                </p>
                                <p className="mt-2 text-[10px] font-mono text-quaternary uppercase tracking-wider">
                                    // Dr. Cooper, on writing legal disclaimers
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-secondary px-6 py-4 shrink-0 flex items-center justify-between">
                            <p className="text-[10px] text-quaternary">
                                &copy; {new Date().getFullYear()} de_cooper.ai &mdash; A satirical fan project.
                            </p>
                            <button
                                onClick={onClose}
                                className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-primary/90 transition-colors"
                            >
                                I Understand
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
