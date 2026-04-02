export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#3F51B5",
        secondary: "#FF4081",
        accent: "#00BFA5",
        background: "#F5F5F5",
        text: "#333333",
        funPop: "#FFEB3B",
        heroGradientStart: "#3F51B5",
        heroGradientMiddle: "#FF4081",
        heroGradientEnd: "#00BFA5",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(to bottom right, #3F51B5, #FF4081, #00BFA5)",
      },
      keyframes: {
        smoothPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: 1 },
          "50%": { transform: "scale(1.08)", opacity: 0.9 },
        },
      },
      animation: {
        smoothPulse: "smoothPulse 3s ease-in-out infinite",
      },
      borderRadius: {
        'xl': '1rem',
      },
      boxShadow: {
        'card': '0 10px 20px rgba(0,0,0,0.1)',
        'btn': '0 4px 6px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   darkMode: 'class',
//   content: ["./src/**/*.{js,jsx,ts,tsx}"], // This ensures Tailwind sees your files
//   theme: {
//     extend: {
//       fontFamily: {
//         poppins: ["Poppins", "sans-serif"],
//       },
//       colors: {
//         primary: "#3F51B5",
//         secondary: "#FF4081",
//         accent: "#00BFA5",
//         background: "#F5F5F5",
//         text: "#333333",
//         funPop: "#FFEB3B",
//       },
//       boxShadow: {
//         'card': '0 10px 20px rgba(0,0,0,0.1)',
//       },
//     },
//   },
//   plugins: [require('@tailwindcss/typography')],
// };
// // /** @type {import('tailwindcss').Config} */
// // module.exports = {
// //   darkMode: 'class',
// //   content: ["./src/**/*.{js,jsx,ts,tsx}"],
// //   theme: {
// //     extend: {
// //       fontFamily: {
// //         poppins: ["Poppins", "sans-serif"], // clean, friendly, modern
// //       },
// //       colors: {
// //         primary: "#3F51B5",        // Indigo - main tech color
// //         secondary: "#FF4081",      // Bright Pink - highlights/buttons
// //         accent: "#00BFA5",         // Aqua/Teal - freshness & modern
// //         background: "#F5F5F5",     // Neutral light gray
// //         text: "#333333",            // Charcoal - softer than black
// //         funPop: "#FFEB3B",          // Sunny Yellow - for playful accents
// //         heroGradientStart: "#3F51B5",
// //         heroGradientMiddle: "#FF4081",
// //         heroGradientEnd: "#00BFA5",
// //       },
// //       backgroundImage: {
// //         "hero-gradient": "linear-gradient(to bottom right, #3F51B5, #FF4081, #00BFA5)",
// //       },
// //       keyframes: {
// //         smoothPulse: {
// //           "0%, 100%": { transform: "scale(1)", opacity: 1 },
// //           "50%": { transform: "scale(1.08)", opacity: 0.9 },
// //         },
// //       },
// //       animation: {
// //         smoothPulse: "smoothPulse 3s ease-in-out infinite",
// //       },
// //       borderRadius: {
// //         'xl': '1rem', // consistent rounded corners for buttons/cards
// //       },
// //       boxShadow: {
// //         'card': '0 10px 20px rgba(0,0,0,0.1)',
// //         'btn': '0 4px 6px rgba(0,0,0,0.1)',
// //       },
// //     },
// //   },
// //   plugins: [require('@tailwindcss/typography')],

// // };
