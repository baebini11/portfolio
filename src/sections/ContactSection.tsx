import React from "react";

const ContactSection: React.FC = () => {
  return (
    <section
      id="contact"
      className="py-16 text-center bg-gray-100 dark:bg-gray-900"
    >
      <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Contact
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        Email: baebini@naver.com
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        GitHub:
        <a href="https://github.com/baebini11" className="text-blue-500">
          baebini
        </a>
      </p>
    </section>
  );
};

export default ContactSection;
