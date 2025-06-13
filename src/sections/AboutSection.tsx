import React from "react";

const AboutSection: React.FC = () => {
  return (
    <section
      id="profile"
      className="py-16 text-center bg-gray-100 dark:bg-gray-900"
    >
      <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        About Me
      </h2>
      <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
        SSAFY 11기 과정 수료
        <br />
        프론트 엔드 / 유니티 개발자
        <br />
        도전, 책임, 그리고 감성
      </p>
    </section>
  );
};

export default AboutSection;
