// app/page.tsx (or pages/index.tsx if using the Pages Router)
'use client';
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black px-6 sm:px-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
        Pinged.
      </h1>
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
        Ping each other with simplicity!
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mb-10 text-center max-w-md">
        Post and chat securely in real-time. Please log in or sign up to continue.
      </p>

      <div className="flex gap-4 flex-col sm:flex-row">
        <Link href="/login">
          <button className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition dark:bg-white dark:text-black dark:hover:bg-gray-300">
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button className="border border-black px-6 py-3 rounded-full hover:bg-gray-100 transition dark:border-white dark:text-white dark:hover:bg-gray-800">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}
