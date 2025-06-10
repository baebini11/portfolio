import React, { useState } from "react";

const avatarUrl = "https://avatars.githubusercontent.com/u/156386874?v=4";

const AvatarMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isFocus, setFocus] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setFocus(true)}
      onMouseLeave={() => setFocus(false)}
      onClick={() => setOpen(!open)}
    >
      <img
        src={avatarUrl}
        alt="avatar"
        className={`rounded-xl border-white shadow-lg cursor-pointer transition-all ${
          isFocus ? "w-20 h-20 border-5" : "w-20 h-20 border-4"
        }`}
      />
      <div
        className={`flex flex-col items-center bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl shadow-md mt-2 overflow-hidden transition-all duration-300 ${
          open ? "max-h-40 py-2" : "max-h-0"
        }`}
        style={{ width: "8rem" }}
      >
        <a
          href="#profile"
          className="w-full text-center py-1 hover:text-blue-500"
        >
          프로필
        </a>
        <a
          href="#projects"
          className="w-full text-center py-1 hover:text-blue-500"
        >
          프로젝트
        </a>
        <a
          href="#contact"
          className="w-full text-center py-1 hover:text-blue-500"
        >
          콘택트
        </a>
      </div>
    </div>
  );
};

export default AvatarMenu;
