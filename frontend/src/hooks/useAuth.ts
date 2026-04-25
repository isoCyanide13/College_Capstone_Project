// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { saveToken, saveUser, removeToken, getUser } from "@/lib/auth";

// const API_BASE = "http://127.0.0.1:8000";

// export function useAuth() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [user, setUser] = useState<any>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // ─── Read from localStorage only after component mounts in browser ──
//   useEffect(() => {
//     const savedUser = getUser();
//     if (savedUser) {
//       setUser(savedUser);
//       setIsAuthenticated(true);
//     }
//   }, []);

//   async function register(name: string, email: string, password: string) {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(`${API_BASE}/api/auth/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, password, role: "student" }),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         if (Array.isArray(data.detail)) {
//             setError(data.detail[0]?.msg || "Registration failed");
//         } else {
//             setError(data.detail || "Registration failed");
//         }
//         return false;
//       }
//       return await login(email, password);
//     } catch (err) {
//       setError("Cannot connect to server. Is the backend running?");
//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   async function login(email: string, password: string) {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(`${API_BASE}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         if (Array.isArray(data.detail)) {
//             setError(data.detail[0]?.msg || "Login failed");
//         } else {
//         setError(data.detail || "Login failed");
//         }
//         return false;
//       }
//       const userData = { id: data.user_id, name: data.name, role: data.role };
//       saveToken(data.access_token);
//       saveUser(userData);
//       setUser(userData);
//       setIsAuthenticated(true);
//       router.push("/dashboard");
//       return true;
//     } catch (err) {
//       setError("Cannot connect to server. Is the backend running?");
//       return false;
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   function logout() {
//     removeToken();
//     setUser(null);
//     setIsAuthenticated(false);
//     router.push("/login");
//   }

//   return {
//     login,
//     register,
//     logout,
//     isLoading,
//     error,
//     setError,
//     isAuthenticated,
//     user,
//   };
// }

// useAuth now comes from AuthContext — one shared state for the whole app
export { useAuth } from "@/context/AuthContext";