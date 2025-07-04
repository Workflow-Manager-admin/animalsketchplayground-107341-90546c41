module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#f8f8fc",
          gradient1: "#f6fff9",
          gradient2: "#e4f0ff"
        },
        primary: "#4e73df",
        highlight: "#fbbf24",
        accent: {
          pink: "#ff6b81",
          green: "#10b981",
          indigo: "#6366f1"
        }
      },
      fontFamily: {
        heading: ["Poppins", "Nunito", "Fredoka", "system-ui", "sans-serif"],
        body: ["Inter", "Open Sans", "Quicksand", "sans-serif"],
        titleAlt: ["Bungee", "'Press Start 2P'", "cursive"]
      },
      boxShadow: {
        playful: "0 1px 6px 0 rgba(76,122,211,0.08), 0 0px 24px 8px rgba(255,187,36,0.06)"
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        playground: {
          "primary": "#4e73df",
          "secondary": "#fbbf24",
          "accent": "#ff6b81",
          "neutral": "#6366f1",
          "base-100": "#f8f8fc",
          "base-200": "#f6fff9",
          "info": "#10b981",
          "success": "#10b981",
          "warning": "#fbbf24",
          "error": "#ff6b81",
        }
      }
    ]
  }
}
