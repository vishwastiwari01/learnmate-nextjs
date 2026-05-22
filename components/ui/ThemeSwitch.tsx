"use client";
import React from 'react';

interface ThemeSwitchProps {
  theme: string | undefined;
  toggleTheme: () => void;
}

export default function ThemeSwitch({ theme, toggleTheme }: ThemeSwitchProps) {
  const isLight = theme === 'light';

  return (
    <div className="theme-switch-wrapper">
      <style>{`
        /* Theme Switch styles */
        .theme-switch-wrapper .switch {
          font-size: 15px;
          position: relative;
          display: inline-block;
          width: 4em;
          height: 2.2em;
          border-radius: 30px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        }

        /* Hide default HTML checkbox */
        .theme-switch-wrapper .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        /* The slider */
        .theme-switch-wrapper .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #1e1e2e;
          transition: 0.4s;
          border-radius: 30px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .theme-switch-wrapper .slider:before {
          position: absolute;
          content: "";
          height: 1.2em;
          width: 1.2em;
          border-radius: 20px;
          left: 0.45em;
          bottom: 0.45em;
          transition: 0.4s;
          transition-timing-function: cubic-bezier(0.81, -0.04, 0.38, 1.5);
          box-shadow: inset 8px -4px 0px 0px #fff;
          background-color: transparent;
        }

        .theme-switch-wrapper .switch input:checked + .slider {
          background-color: #00a6ff;
          border-color: rgba(0, 0, 0, 0.05);
        }

        .theme-switch-wrapper .switch input:checked + .slider:before {
          transform: translateX(1.8em);
          box-shadow: inset 15px -4px 0px 15px #ffcf48;
        }

        .theme-switch-wrapper .star {
          background-color: #fff;
          border-radius: 50%;
          position: absolute;
          width: 3px;
          height: 3px;
          transition: all 0.4s;
        }

        .theme-switch-wrapper .star_1 {
          left: 2.5em;
          top: 0.5em;
        }

        .theme-switch-wrapper .star_2 {
          left: 2.2em;
          top: 1.2em;
          width: 4px;
          height: 4px;
        }

        .theme-switch-wrapper .star_3 {
          left: 3em;
          top: 0.9em;
        }

        .theme-switch-wrapper .switch input:checked + .slider .star {
          opacity: 0;
          transform: scale(0);
        }

        .theme-switch-wrapper .cloud {
          width: 3.2em;
          position: absolute;
          bottom: -1.2em;
          left: -0.9em;
          opacity: 0;
          transition: all 0.4s;
          pointer-events: none;
        }

        .theme-switch-wrapper .switch input:checked + .slider .cloud {
          opacity: 1;
          bottom: -0.7em;
          left: -0.4em;
        }
      `}</style>
      <label className="switch">
        <input 
          checked={isLight} 
          onChange={toggleTheme} 
          id="theme-checkbox" 
          type="checkbox" 
          aria-label="Toggle Theme"
        />
        <span className="slider">
          <div className="star star_1" />
          <div className="star star_2" />
          <div className="star star_3" />
          <svg viewBox="0 0 16 16" className="cloud_1 cloud">
            <path transform="matrix(.77976 0 0 .78395-299.99-418.63)" fill="#fff" d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925" />
          </svg>
        </span>
      </label>
    </div>
  );
}
