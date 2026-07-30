"use client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  BookOpen,
  MonitorPlay,
  Layers,
  User,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const spring = { type: "spring" as const, stiffness: 420, damping: 28 };

export default function Navbar() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  /* Simulated auth state — replace with real auth hook later */
  const { isAuthenticated, logout, user } = useAuth();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Question Practice", href: "/question-practice", icon: BookOpen },
    { name: "Mock Interview", href: "/mock-interview", icon: MonitorPlay },
    { name: "Full Interview", href: "/full-interview", icon: Layers },
  ];

  const authLinks = [
    { name: "Login", href: "/login", icon: LogIn, outlined: true },
    { name: "Sign Up", href: "/register", icon: UserPlus },
  ];

  /* Close profile dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  return (
    <nav
      id="main-nav"
      className="fixed top-0 left-0 right-0 z-50 bg-surface-raised nav-seam"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ scale: 1.08, rotate: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={spring}
                className="w-8 h-8 notch-sm bg-ink flex items-center justify-center"
              >
                <Mic className="w-4 h-4 text-surface" />
              </motion.div>
              <span className="font-headline font-bold text-lg tracking-tight text-ink">
                Mock<span className="text-accent">AI</span>
              </span>
            </Link>
          </div>

          {/* Center Nav — Desktop */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-8">
            <div className="flex items-center space-x-1 justify-center">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.name}
                    whileHover={{ y: -1 }}
                    whileTap={{ y: 0, scale: 0.97 }}
                    transition={spring}
                  >
                    <Link
                      href={link.href}
                      className={clsx(
                        "relative px-4 py-2 text-sm font-headline font-medium snap-transition block",
                        isActive ? "text-ink" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {link.name}
                      </span>

                      {isActive && (
                        <motion.span
                          layoutId="nav-active-underline"
                          transition={spring}
                          className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Side — Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              /* Profile Dropdown */
              <div className="relative" ref={profileRef}>
                <motion.button
                  id="profile-toggle"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  transition={spring}
                  onClick={() => setProfileOpen((p) => !p)}
                  className={clsx(
                    "w-9 h-9 notch-sm flex items-center justify-center border snap-transition",
                    profileOpen
                      ? "bg-accent-light border-accent text-accent"
                      : "bg-surface-alt border-border text-ink-muted hover:border-border-strong hover:text-ink"
                  )}
                >
                  <User className="w-4 h-4" />
                </motion.button>

                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-56 bg-surface-raised border border-border rounded-sm shadow-sm py-1 z-50"
                  >
                    <div className="px-4 py-3 hairline">
                      <p className="font-headline text-sm font-semibold text-ink">
                        {user?.name || "User"}
                      </p>
                      <p className="font-body text-xs text-ink-faint mt-0.5">
                        {user?.role || "student"}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-headline text-ink-muted hover:text-ink hover:bg-surface-alt snap-transition"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-headline text-ink-muted hover:text-ink hover:bg-surface-alt snap-transition"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="hairline my-1" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-headline text-danger hover:bg-surface-alt snap-transition w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Auth Links (existing pattern preserved) */
              authLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.name}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0, scale: 0.96 }}
                    transition={spring}
                  >
                    <Link
                      href={link.href}
                      className={clsx(
                        "flex items-center gap-2 text-sm font-headline font-medium px-4 py-2 notch-sm snap-transition",
                        link.outlined
                          ? "text-ink-muted hover:text-ink border border-border hover:border-border-strong"
                          : "bg-ink text-surface-raised hover:bg-accent-hover"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            id="mobile-menu-toggle"
            whileTap={{ scale: 0.9 }}
            transition={spring}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-ink-muted hover:text-ink snap-transition"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:hidden bg-surface-raised border-t border-border overflow-hidden"
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-headline font-medium snap-transition",
                    isActive
                      ? "bg-accent-light text-ink"
                      : "text-ink-muted hover:text-ink hover:bg-surface-alt"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="hairline mx-4" />
          <div className="px-4 py-3 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-headline font-medium text-ink-muted hover:text-ink hover:bg-surface-alt snap-transition"
                >
                  <User className="w-4 h-4" />
                  Profile & Settings
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-headline text-danger hover:bg-surface-alt snap-transition w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                {authLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={clsx(
                        "flex-1 flex items-center justify-center gap-2 text-sm font-headline font-medium px-4 py-2.5 rounded-sm snap-transition",
                        link.outlined
                          ? "text-ink-muted border border-border hover:border-border-strong"
                          : "bg-ink text-surface-raised hover:bg-accent-hover"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}