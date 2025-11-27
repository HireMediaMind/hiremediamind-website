export default {
    content: [
        "./index.html",
        "./about-us.html",
        "./services/**/*.html",
        "./case-studies/**/*.html",
        "./how-we-work/**/*.html",
        "./blog/**/*.html",
        "./src/**/*.html",
        "./js/**/*.js"
    ],
    theme: {
        extend: {
            colors: {
                primary: "#7C3AED",
                secondary: "#06B6D4",
                accent: "#10B981"
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-in",
                "slide-up": "slideUp 0.5s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" }
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" }
                }
            }
        }
    },
    plugins: []
};



