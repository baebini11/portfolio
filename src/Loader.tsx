import React from "react";

const Loader: React.FC = () => {
  const text = "Flowing...";
  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray-900 text-white">
      {text.split("").map((ch, idx) => (
        <span
          key={idx}
          className="slide-fade opacity-0"
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          {ch}
        </span>
      ))}
    </div>
  );
};

export default Loader;
