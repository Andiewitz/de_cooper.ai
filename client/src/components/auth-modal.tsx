"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Lock } from "lucide-react";

declare global {
    interface Window {
        google?: any;
    }
}

// Google One Tap profiles from screenshots
interface CharacterProfile {
    name: string;
    email: string;
    pass: string;
    role: string;
    avatar: string;
}

const CHARACTERS: CharacterProfile[] = [
    {
        name: "Andrei Grace",
        email: "gracefulandrei@gmail.com",
        pass: "SecurePassword123!",
        role: "Student Plan",
        avatar: "AG"
    },
    {
        name: "Vhemard Galleto",
        email: "galletovhemard54@gmail.com",
        pass: "SecurePassword123!",
        role: "Premium Learner",
        avatar: "VG"
    },
    {
        name: "Holly Grace",
        email: "hollygrace@gmail.com",
        pass: "SecurePassword123!",
        role: "Student Plan",
        avatar: "HG"
    }
];

interface AuthModalProps {
    isOpen: boolean;
    initialMode: "login" | "register";
    onClose: () => void;
}

export function AuthModal({ isOpen, initialMode, onClose }: AuthModalProps) {
    const router = useRouter();
    const { login, register, googleLogin, error, clearError, isLoading } = useAuth();
    const [mode, setMode] = useState<"login" | "register">(initialMode);
    
    // Sync mode when initialMode changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            clearError();
        }
    }, [isOpen, initialMode]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const [registerData, setRegisterData] = useState({
        email: "",
        username: "",
        password: "",
        display_name: "",
    });

    // Auto-typing states for mock login
    const [isAutoTyping, setIsAutoTyping] = useState(false);
    const [showOneTap, setShowOneTap] = useState(false);

    // Slide in Google One Tap helper after 800ms when modal is open in login mode
    useEffect(() => {
        if (isOpen && mode === "login") {
            const timer = setTimeout(() => {
                setShowOneTap(true);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setShowOneTap(false);
        }
    }, [isOpen, mode]);

    // Real Google Identity Services (GSI) Client initialization
    useEffect(() => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId || !isOpen) return;

        // Handler for Google Token credential
        const handleGoogleCredentialResponse = async (response: any) => {
            setIsSubmitting(true);
            clearError();
            try {
                await googleLogin(response.credential);
                onClose();
                router.push("/learn");
            } catch (err) {
                // Error is handled inside Google Login context callback
            } finally {
                setIsSubmitting(false);
            }
        };

        const initGoogleAuth = () => {
            if (typeof window === "undefined" || !window.google) return;

            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleCredentialResponse,
                    auto_select: false,
                });

                // Render the real Google Sign-In button
                const btnContainer = document.getElementById("google-signin-btn");
                if (btnContainer) {
                    window.google.accounts.id.renderButton(btnContainer, {
                        type: "standard",
                        theme: "outline",
                        size: "large",
                        text: "continue_with",
                        shape: "rectangular",
                        logo_alignment: "left",
                        width: btnContainer.offsetWidth || 356,
                    });
                }

                // Show native Google One Tap prompt if in login mode
                if (mode === "login") {
                    window.google.accounts.id.prompt((notification: any) => {
                        if (notification.isNotDisplayed()) {
                            console.log("Native One Tap not displayed:", notification.getNotDisplayedReason());
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to initialize Google One Tap:", error);
            }
        };

        // Load dynamic GSI script if not loaded
        if (window.google?.accounts?.id) {
            const timer = setTimeout(initGoogleAuth, 150);
            return () => clearTimeout(timer);
        }

        const script = document.createElement("script");
        script.id = "google-gsi-client";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogleAuth;
        document.body.appendChild(script);

        return () => {
            // Keep script loaded but we can remove popup if any
        };
    }, [isOpen, mode, googleLogin, clearError, onClose, router]);

    // Autotyping mechanism
    const handleOneTapLogin = (character: CharacterProfile) => {
        if (isAutoTyping || isSubmitting || isLoading) return;
        
        setIsAutoTyping(true);
        clearError();
        
        let currentEmail = "";
        let currentPass = "";
        let i = 0;
        let j = 0;

        // Type Email first
        const emailInterval = setInterval(() => {
            if (i < character.email.length) {
                currentEmail += character.email[i];
                setLoginData(prev => ({ ...prev, email: currentEmail }));
                i++;
            } else {
                clearInterval(emailInterval);
                
                // Type password
                setTimeout(() => {
                    const passInterval = setInterval(() => {
                        if (j < character.pass.length) {
                            currentPass += character.pass[j];
                            setLoginData(prev => ({ ...prev, password: currentPass }));
                            j++;
                        } else {
                            clearInterval(passInterval);
                            
                            // Auto submit
                            setTimeout(async () => {
                                setIsSubmitting(true);
                                try {
                                    await login({ email: character.email, password: character.pass });
                                    onClose();
                                    router.push("/learn");
                                } catch {
                                    setIsAutoTyping(false);
                                    setIsSubmitting(false);
                                }
                            }, 500);
                        }
                    }, 40);
                }, 300);
            }
        }, 30);
    };

    const handleLoginSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        setIsSubmitting(true);

        try {
            await login(loginData);
            onClose();
            router.push("/learn");
        } catch {
            // Error handled by Auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        setIsSubmitting(true);

        try {
            await register(registerData);
            onClose();
            router.push("/learn");
        } catch {
            // Error handled by Auth context
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 font-sans select-text">
                    {/* Backdrop blurred overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleBackdropClick}
                        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
                    >
                        {/* Centered Modal Card */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.96, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 15 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card
                            className="w-full max-w-[420px] bg-white border border-neutral-200 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-8 relative cursor-default"
                        >
                            {/* Close Button */}
                            <button 
                                onClick={onClose}
                                className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full p-1 hover:bg-neutral-50 cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="size-5" />
                            </button>

                            {/* Badge indicator */}
                            <div className="flex justify-center mb-5">
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-700 font-bold">
                                    <span className="size-1 rounded-full bg-neutral-600 animate-pulse" />
                                    {mode === "login" ? "Sign in to your account" : "Enroll in the academy"}
                                </div>
                            </div>

                            <h1 className="text-xl font-bold tracking-tight text-center text-neutral-900 mb-1">
                                {mode === "login" ? "Welcome back" : "Create your account"}
                            </h1>
                            <p className="text-xs text-neutral-500 text-center mb-6 max-w-xs mx-auto leading-relaxed">
                                {mode === "login" 
                                    ? "Access your rigorous edtech workspace and personalized learning tracks." 
                                    : "Start your tailored study plan today with fully interactive memory retention graphs."}
                            </p>

                            {/* Google Sign In button */}
                            {mode === "login" && (
                                <>
                                    {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                                        <div className="w-full flex justify-center mb-5 min-h-[44px]">
                                            <div id="google-signin-btn" className="w-full flex justify-center" />
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleOneTapLogin(CHARACTERS[0])}
                                            disabled={isAutoTyping || isSubmitting}
                                            className="w-full h-11 border border-neutral-900 rounded-lg flex items-center justify-center gap-2.5 text-[14px] font-bold text-neutral-900 bg-white hover:bg-neutral-50 active:bg-neutral-100 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                                        >
                                            <svg className="size-4.5" viewBox="0 0 24 24" fill="none">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            Continue with Google (Demo Auto-Fill)
                                        </button>
                                    )}

                                    {/* Or separator */}
                                    <div className="flex items-center gap-3 my-5">
                                        <div className="h-px bg-neutral-200 flex-1" />
                                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">or</span>
                                        <div className="h-px bg-neutral-200 flex-1" />
                                    </div>
                                </>
                            )}

                            {/* Error display */}
                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold leading-relaxed text-left">
                                    {error}
                                </div>
                            )}

                            {/* Login Form */}
                            {mode === "login" ? (
                                <form onSubmit={handleLoginSubmit} className="space-y-4">
                                    {/* EMAIL INPUT (Figma Style) */}
                                    <div className="relative bg-[#F2F2F2] hover:bg-[#EAEAEA] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-transparent focus-within:border-transparent px-4 py-2.5 rounded-lg transition-all duration-150 text-left">
                                        <label className="block text-[9px] font-black text-neutral-500 tracking-wider uppercase mb-0.5 select-none">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 font-semibold placeholder:text-neutral-400 p-0 focus:ring-0"
                                            value={loginData.email}
                                            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                                            disabled={isAutoTyping || isSubmitting}
                                            required
                                        />
                                    </div>

                                    {/* PASSWORD INPUT (Figma Style) */}
                                    <div className="relative bg-[#F2F2F2] hover:bg-[#EAEAEA] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-transparent focus-within:border-transparent px-4 py-2.5 rounded-lg transition-all duration-150 text-left">
                                        <label className="block text-[9px] font-black text-neutral-500 tracking-wider uppercase mb-0.5 select-none">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Enter password"
                                            className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 font-semibold placeholder:text-neutral-400 p-0 focus:ring-0"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                                            disabled={isAutoTyping || isSubmitting}
                                            required
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isAutoTyping || isSubmitting || isLoading}
                                        className="w-full h-11 bg-neutral-950 text-white rounded-lg flex items-center justify-center text-[14px] font-bold hover:bg-neutral-800 active:bg-black transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                    >
                                        {isAutoTyping ? (
                                            <span className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-white animate-bounce" />
                                                Autotyping credentials...
                                            </span>
                                        ) : isSubmitting || isLoading ? (
                                            "Logging in..."
                                        ) : (
                                            "Log in"
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                                    {/* DISPLAY NAME INPUT (Figma Style) */}
                                    <div className="relative bg-[#F2F2F2] hover:bg-[#EAEAEA] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-transparent focus-within:border-transparent px-4 py-2.5 rounded-lg transition-all duration-150 text-left">
                                        <label className="block text-[9px] font-black text-neutral-500 tracking-wider uppercase mb-0.5 select-none">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 font-semibold placeholder:text-neutral-400 p-0 focus:ring-0"
                                            value={registerData.display_name}
                                            onChange={(e) => setRegisterData(prev => ({ ...prev, display_name: e.target.value }))}
                                        />
                                    </div>

                                    {/* USERNAME INPUT (Figma Style) */}
                                    <div className="relative bg-[#F2F2F2] hover:bg-[#EAEAEA] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-transparent focus-within:border-transparent px-4 py-2.5 rounded-lg transition-all duration-150 text-left">
                                        <label className="block text-[9px] font-black text-neutral-500 tracking-wider uppercase mb-0.5 select-none">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="username"
                                            className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 font-semibold placeholder:text-neutral-400 p-0 focus:ring-0"
                                            value={registerData.username}
                                            onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    {/* EMAIL INPUT (Figma Style) */}
                                    <div className="relative bg-[#F2F2F2] hover:bg-[#EAEAEA] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-transparent focus-within:border-transparent px-4 py-2.5 rounded-lg transition-all duration-150 text-left">
                                        <label className="block text-[9px] font-black text-neutral-500 tracking-wider uppercase mb-0.5 select-none">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 font-semibold placeholder:text-neutral-400 p-0 focus:ring-0"
                                            value={registerData.email}
                                            onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    {/* PASSWORD INPUT (Figma Style) */}
                                    <div className="relative bg-[#F2F2F2] hover:bg-[#EAEAEA] focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900 border border-transparent focus-within:border-transparent px-4 py-2.5 rounded-lg transition-all duration-150 text-left">
                                        <label className="block text-[9px] font-black text-neutral-500 tracking-wider uppercase mb-0.5 select-none">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="At least 8 characters"
                                            className="w-full bg-transparent border-none outline-none text-[13.5px] text-neutral-900 font-semibold placeholder:text-neutral-400 p-0 focus:ring-0"
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="flex items-start gap-2 text-[10px] text-neutral-500 leading-normal bg-neutral-50 border border-neutral-100 rounded-lg p-2.5 text-left">
                                        <Lock className="size-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                                        <span>Ensure password has 8+ characters, including letters & numbers.</span>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || isLoading}
                                        className="w-full h-11 bg-neutral-950 text-white rounded-lg flex items-center justify-center text-[14px] font-bold hover:bg-neutral-800 active:bg-black transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                    >
                                        {isSubmitting || isLoading ? "Registering..." : "Create Account"}
                                    </button>
                                </form>
                            )}

                            {/* Bottom Switch Link */}
                            <div className="mt-6 flex flex-col items-center gap-2 text-[12px] font-bold">
                                {mode === "login" ? (
                                    <>
                                        <button 
                                            type="button"
                                            onClick={() => alert("SSO login is enabled for university and enterprise domain accounts.")}
                                            className="text-neutral-600 hover:text-black transition-colors cursor-pointer"
                                        >
                                            Use single sign-on
                                        </button>
                                        <span className="text-neutral-400 font-normal mt-1">
                                            No account?{" "}
                                            <button
                                                type="button"
                                                onClick={() => { setMode("register"); clearError(); }}
                                                className="font-bold text-neutral-900 hover:text-neutral-700 underline underline-offset-4 decoration-1 cursor-pointer bg-transparent border-none p-0"
                                            >
                                                Create one
                                            </button>
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-neutral-400 font-normal">
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => { setMode("login"); clearError(); }}
                                            className="font-bold text-neutral-900 hover:text-neutral-700 underline underline-offset-4 decoration-1 cursor-pointer bg-transparent border-none p-0"
                                        >
                                            Sign in
                                        </button>
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* MOCK GOOGLE ONE TAP DIALOG (TOP-RIGHT) */}
                    <AnimatePresence>
                        {showOneTap && mode === "login" && !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                            <motion.div
                                initial={{ opacity: 0, y: -40, x: 20 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, y: -20, x: 10 }}
                                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                                className="fixed top-5 right-5 z-55 w-[350px] bg-white border border-neutral-200 rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 text-left text-neutral-900 hidden md:block"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3.5">
                                    <div className="flex gap-2">
                                        <svg className="size-5 mt-0.5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        </svg>
                                        <div>
                                            <h4 className="text-[12px] font-bold text-neutral-800 leading-none mb-1">
                                                Sign in to de_cooper.ai
                                            </h4>
                                            <p className="text-[10px] font-medium text-neutral-500 leading-none">
                                                with google.com
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowOneTap(false)}
                                        className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-full hover:bg-neutral-50 cursor-pointer"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>

                                {/* List of Screenshot Profiles */}
                                <div className="space-y-1 mb-2 max-h-[220px] overflow-y-auto pr-1">
                                    {CHARACTERS.map((char) => (
                                        <button
                                            key={char.email}
                                            onClick={() => handleOneTapLogin(char)}
                                            disabled={isAutoTyping || isSubmitting}
                                            className="w-full text-left p-2.5 rounded-lg hover:bg-neutral-50 active:bg-neutral-100 flex items-center gap-3 transition-colors cursor-pointer group disabled:opacity-50"
                                        >
                                            <div className="size-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-white group-hover:scale-105 transition-transform">
                                                {char.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11.5px] font-bold text-neutral-800 leading-tight">
                                                    {char.name}
                                                </div>
                                                <div className="text-[10px] text-neutral-400 leading-tight truncate">
                                                    {char.email}
                                                </div>
                                                <div className="text-[9px] text-neutral-500 bg-neutral-100 rounded px-1.5 py-0.5 inline-block mt-0.5 leading-none font-bold">
                                                    {char.role}
                                                </div>
                                            </div>
                                            <ChevronRight className="size-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[9px] text-neutral-400 font-medium">
                                    <span>Google Account Helper</span>
                                    <span className="text-neutral-500 font-bold">Safe Sign-In</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>
    );
}
