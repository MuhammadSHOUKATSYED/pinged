'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  FaHome,
  FaUser,
  FaSearch,
  FaEnvelope,
  FaUserFriends,
  FaUsers,
  FaEllipsisH,
  FaSignOutAlt,
  FaCog,
  FaQuestionCircle,
  FaBolt,
} from 'react-icons/fa';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="flex min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-black p-6 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 text-black dark:text-white mb-10">
            <FaBolt size={28} />
            <h2 className="text-3xl font-extrabold">Pinged</h2>
          </div>

          {/* Sidebar Links */}
          <nav className="flex flex-col gap-3">
            <SidebarLink href="/dashboard" icon={<FaHome size={24} />} text="Home" />
            <SidebarLink href="/dashboard/explore" icon={<FaSearch size={24} />} text="Explore" />
            <SidebarLink href="/dashboard/messages" icon={<FaEnvelope size={24} />} text="Messages" />
            <SidebarLink href="/dashboard/profile" icon={<FaUser size={24} />} text="Profile" />
            <SidebarLink href="/dashboard/followers" icon={<FaUserFriends size={24} />} text="Followers" />
            <SidebarLink href="/dashboard/following" icon={<FaUsers size={24} />} text="Following" />

            {/* More Toggle */}
            <button
              onClick={() => setShowMore(!showMore)}
              aria-expanded={showMore}
              aria-controls="more-options"
              className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition w-full text-left"
            >
              <FaEllipsisH size={24} />
              <span>More</span>
            </button>

            {/* More Options */}
            {showMore && (
              <div id="more-options" className="ml-8 flex flex-col gap-2 mt-2 text-gray-600 dark:text-gray-400">
                <SidebarLink href="/dashboard/settings" icon={<FaCog size={20} />} text="Settings" />
                <SidebarLink href="/dashboard/help" icon={<FaQuestionCircle size={20} />} text="Help" />
                <SidebarButton icon={<FaSignOutAlt size={20} />} text="Logout" onClick={() => console.log('Logging out...')} />
              </div>
            )}
          </nav>

          {/* Post Button */}
          <Link href="/dashboard/newPost" className="block mt-8 mb-30">
            <button className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-full font-semibold text-lg transition">
              Post
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

function SidebarButton({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition w-full text-left"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}
