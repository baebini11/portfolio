import React from "react";

const AboutSection: React.FC = () => {
  return (
    <section
      id="profile"
      className="py-16 text-center bg-gray-100 dark:bg-gray-900"
      data-aos="zoom-in"
    >
      <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        About Me
      </h2>
      <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
        SSAFY 11기 과정을 수료했으며, 음악과 개발을 함께 하고 있습니다.
      </p>
    </section>
  );
};

export default AboutSection;
