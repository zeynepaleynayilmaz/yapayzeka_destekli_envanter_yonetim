import { useState } from "react";
import { Link } from "react-router-dom";
export function Navbar({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="w-full ml-20">
      <div className="h-20 px-6 flex justify-between items-center bg-gradient-to-r from-black to-gray-600 shadow-lg">
        <div className="flex items-center">
          <a
            href="/"
            className="font-bold text-white text-2xl tracking-wider hover:text-orange-400 transition-colors"
          >
            DepoStok
          </a>
          <div className="ml-8 flex space-x-1">
            <span className="px-3 py-1 text-xs text-gray-300 bg-gray-700 rounded-full">
              Dashboard
            </span>
            <span className="animate-pulse px-2 py-1 text-xs text-green-300 bg-green-900 rounded-full">
              Online
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="search"
              placeholder="Ara..."
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 w-48"
            />
            <svg
              className="w-4 h-4 absolute right-3 top-3 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <button
            onClick={toggleMenu}
            className="flex items-center space-x-3 focus:outline-none group"
          >
            <span className="font-medium text-gray-300 group-hover:text-orange-400 transition-colors">
              Aleyna Yılmaz
            </span>
            <img
              src="src/assets/vesikalik2.png"
              className="h-10 w-10 rounded-full border-2 border-transparent group-hover:border-orange-400 transition-colors"
              alt="Profile"
            />
          </button>
        </div>

        {menuOpen && (
          <div className="absolute right-6 top-16 bg-white rounded-lg shadow-xl w-56 py-2 border border-gray-100 transform transition-all duration-300 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">Aleyna Yılmaz</p>
              <p className="text-xs text-gray-500">admin@depostok.com</p>
            </div>
            <ul className="py-1">
              <li className="px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors">
                <a
                  href="/profilim"
                  className="flex items-center space-x-3 text-gray-700"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 5c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  <span>Profilim</span>
                </a>
              </li>
              <li className="px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors">
                <a
                  href="/ayarlar"
                  className="flex items-center space-x-3 text-gray-700"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                  <span>Ayarlar</span>
                </a>
              </li>
              <li className="px-4 py-2 hover:bg-red-50 cursor-pointer transition-colors">
                <a
                  href="/login"
                  className="flex items-center space-x-3 text-gray-900"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z" />
                  </svg>
                  <span>Çıkış Yap</span>
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="py-4 px-12" style={{ backgroundColor: "#f7f7f7" }}>
        {children}
      </div>
    </div>
  );
}
