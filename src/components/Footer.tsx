"use client";
import { useTheme } from "../context/ThemeContext";
import "./Footer.scss";

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} Campus & Code</p>
        <div className="theme-toggle-wrapper">
          <span>Светлая</span>
          <label className="theme-switch">
            <input
              type="checkbox"
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
            <span className="slider round"></span>
          </label>
          <span>Тёмная</span>
        </div>
      </div>
    </footer>
  );
}
