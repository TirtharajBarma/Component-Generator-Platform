"use client";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/authSlice";

export default function UserMenu() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
    router.replace("/auth");
  };
  
  return (
    <div className="flex items-center gap-4 p-2">
      <button
        onClick={handleLogout}
        className="bg-black text-white px-6 py-2 rounded-lg border border-black font-semibold shadow-sm hover:bg-white hover:text-black transition text-base focus:outline-none focus:ring-2 focus:ring-black/30"
      >
        Logout
      </button>
    </div>
  );
} 