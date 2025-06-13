import React from "react";

const projects = [
  { title: "Mitchinmat", description: "믿을 수 있는 친구들의 맛집 공유 웹 앱" },
  {
    title: "Dream Guardian",
    description: "유니티를 활용한 멀티 포탑 디펜스 게임",
  },
  {
    title: "Baseball Friends",
    description: "캐릭터와 함께 즐기는 야구 데스크탑 앱",
  },
  {
    title: "인디독",
    description: "Vue3와 Django를 활용한 인디영화DB 웹 컨텐츠",
  },
];

const ProjectsSection: React.FC = () => {
  return (
    <section
      id="projects"
      className="py-16 text-center bg-white dark:bg-gray-800"
    >
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        Projects
      </h2>
      <div className="grid gap-6 px-4 md:grid-cols-2 max-w-4xl mx-auto">
        {projects.map((p, i) => (
          <div
            key={i}
            className="p-4 rounded-lg shadow bg-gray-100 dark:bg-gray-700"
            data-aos="zoom-in"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {p.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;
