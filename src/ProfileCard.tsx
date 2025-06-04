import React from "react";
import reactLogo from "./assets/react.svg";
import unityLogo from "./assets/unity.svg";

const avatarUrl = "https://avatars.githubusercontent.com/u/156386874?v=4";

interface Props {
  onClose: () => void;
  visible: boolean;
}

const ProfileCard: React.FC<Props> = ({ onClose, visible }) => {
  return (
    <div
      className={`absolute inset-0 flex items-start justify-center z-30 transition-all duration-500 pointer-events-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex max-w-md w-full transform transition-all duration-500 ${
          visible ? "translate-y-0 blur-0" : "-translate-y-5 blur-sm"
        }`}
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        <img
          src={avatarUrl}
          alt="profile"
          className="w-24 h-24 object-cover rounded mr-4"
        />
        <div className="flex-1 text-left">
          <h2 className="text-xl font-semibold mb-2">baebini</h2>
          <p className="text-sm mb-2">
            KOMCA musician since 2020~<br />
            Studying in SSAFY since 2024.01~
          </p>
          <p className="mb-1 font-medium">STACKS</p>
          <div className="flex space-x-3 mb-2">
            <img src={unityLogo} alt="Unity" className="w-6 h-6" />
            <img src={reactLogo} alt="React" className="w-6 h-6" />
          </div>
          <p className="text-sm mb-2">
            FE : React(with Redux), TS, JS, Vue3(with Pinia), Electron<br />
            BE : Django (DRF), MySQL, RESTAPI<br />
            AND Unity
          </p>
          <p className="font-medium">Organizations</p>
          <p className="text-sm mb-2">baebini-team</p>
          <p className="text-xs text-gray-500">최근 GitHub 업데이트는 프로필을 참고하세요</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
