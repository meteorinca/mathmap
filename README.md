# Math Skills Tree 🧠

![Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-Web-blue)
![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-F7DF1E)

An interactive, visual learning path tracking web application designed to help you navigate and monitor your math journey. From early arithmetic counting to multivariable calculus and linear algebra, visually trace the prerequisites and progress through all major mathematical milestones.

## 🌟 Features

- **Interactive Skill Tree Canvas**: Experience a pannable and zoomable map (similar to video game skill trees) bridging the gap between math topics.
- **Comprehensive Curriculum**: Maps out a logical progression spanning across:
  - Foundations (Early Math, Kindergarten)
  - Elementary (1st - 5th Grade, Arithmetic)
  - Middle School (6th - 8th Grade, Pre-Algebra)
  - High School Track (Algebra 1 & 2, Geometry, Trigonometry, Statistics)
  - Pre-College / College Prep (Precalculus, College Algebra, Stats & Probability)
  - Calculus (AP Calculus AB/BC, Calculus 1 & 2)
  - Advanced College (Multivariable Calculus, Differential Equations, Linear Algebra)
- **Visual Prerequisites**: Nodes are connected using SVG paths, clearly indicating prerequisite dependencies for advanced topics.
- **Progress Tracking**: Tracks the global progress dynamically and per topic base indicating topics completed vs remaining.
- **Detail Panel**: Slide-in/Slide-up responsive detail panel that displays in-depth information about individual subjects and their sub-topics.
- **Responsive Design**: Polished layout using modern CSS, suitable for both Desktop and touch-enabled mobile interfaces.

## 🚀 Getting Started

The Math Skills Tree runs entirely in the browser using HTML, CSS, and Vanilla JavaScript with no build steps or external dependencies.

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Run locally:**
   Simply open `mathmap/index.html` in your favorite modern web browser. 
   
   Alternatively, you can serve it via a local static HTTP server (e.g., using Python or Node.js):
   ```bash
   # Using Python 3
   cd mathmap
   python3 -m http.server 3000
   # Then open http://localhost:3000 in your browser
   ```

## 🛠️ Tech Stack

- **HTML5**: Semantically structured for modern web standards.
- **CSS3 / Variables**: Completely custom-written, lightweight styling, utilizing CSS custom properties (variables) for a uniform color and interaction scaling.
- **Vanilla JavaScript (`app.js`, `data.js`)**: Dynamic state updates, DOM manipulation, SVG drawing without bloated third-party framework overhead. 

## 📂 Project Structure

```text
├── README.md
└── mathmap/
    ├── index.html       # The main entry layout and HTML skeleton
    ├── styles.css       # Complete web app stylesheets and layout rules
    ├── app.js           # Core application logic, event listeners, canvas panning/zooming
    └── data.js          # Raw data structure defining the courses and prerequisites
```

## 📄 License

This project is open-source and available under standard open-source licenses. Feel free to fork, customize, and extend the Math curriculum definitions inside `data.js` to create representations for other disciplines!
