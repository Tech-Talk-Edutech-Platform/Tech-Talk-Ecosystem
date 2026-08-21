import React from "react";

const sections = [
  {
    title: "Acceptance of Terms",
    content: "By using our platform, users agree to follow the rules outlined here.",
  },
  {
    title: "Services Provided",
    content:
      "We offer online courses, trial classes, and digital learning resources for children and teens.",
  },
  {
    title: "User Accounts",
    content:
      "Parents or guardians must create accounts for their children. Users are responsible for maintaining account confidentiality.",
  },
  {
    title: "Payments and Refunds",
    content:
      "Course fees must be paid upfront. Refunds follow the policy stated on the site.",
  },
  {
    title: "Content Usage",
    content:
      "All course content is for personal use only. No redistribution or commercial use without permission.",
  },
  {
    title: "Privacy",
    content:
      "We collect basic info (name, email, phone) for course registration. Data will not be shared with third parties without consent.",
  },
  {
    title: "Disclaimers",
    content:
      "We do our best to provide accurate educational content but are not liable for any outcomes from using the service.",
  },
  {
    title: "Modifications",
    content:
      "We may update these terms at any time; continued use means acceptance of changes.",
  },
  {
    title: "Governing Law",
    content: "Specify your country/state laws that govern the terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-poppins py-10 px-4 md:px-10">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-card">
        <h1 className="text-4xl font-bold text-primary mb-6 text-center">
          Terms & Conditions
        </h1>
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-2xl font-semibold text-accent mb-2">
              {section.title}
            </h2>
            <p className="text-text leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
// import React from "react";

// export default function TermsPage() {
//   const sections = [
//     {
//       title: "Acceptance of Terms",
//       content: "By using our platform, users agree to follow the rules outlined here.",
//     },
//     {
//       title: "Services Provided",
//       content:
//         "We offer online courses, trial classes, and digital learning resources for children and teens.",
//     },
//     {
//       title: "User Accounts",
//       content:
//         "Parents or guardians must create accounts for their children. Users are responsible for maintaining account confidentiality.",
//     },
//     {
//       title: "Payments and Refunds",
//       content:
//         "Course fees must be paid upfront. Refunds follow the policy stated on the site.",
//     },
//     {
//       title: "Content Usage",
//       content:
//         "All course content is for personal use only. No redistribution or commercial use without permission.",
//     },
//     {
//       title: "Privacy",
//       content:
//         "We collect basic info (name, email, phone) for course registration. Data will not be shared with third parties without consent.",
//     },
//     {
//       title: "Disclaimers",
//       content:
//         "We do our best to provide accurate educational content but are not liable for any outcomes from using the service.",
//     },
//     {
//       title: "Modifications",
//       content:
//         "We may update these terms at any time; continued use means acceptance of changes.",
//     },
//     {
//       title: "Governing Law",
//       content: "Specify your country/state laws that govern the terms.",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-background font-poppins py-10 px-4 md:px-10">
//       <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-card">
//         <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
//           Terms & Conditions
//         </h1>
//         <div className="space-y-6">
//           {sections.map((section, idx) => (
//             <div key={idx} className="border-b border-gray-50 pb-5 last:border-none last:pb-0">
//               <h2 className="text-xl md:text-2xl font-semibold text-accent mb-2">
//                 {section.title}
//               </h2>
//               <p className="text-gray-700 leading-relaxed text-sm md:text-base">
//                 {section.content}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }