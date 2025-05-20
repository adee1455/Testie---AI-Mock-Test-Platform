import React from 'react';

const InstallScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 pt-24">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Install Testie on iOS</h1>
        <p className="text-gray-700 mb-6">
          To install <span className="font-semibold">Testie</span> on your iPhone or iPad:
        </p>
        <ol className="text-left text-gray-700 space-y-3 mb-6 list-decimal list-inside">
          <li>Open <span className="font-semibold">Testie</span> in Safari.</li>
          <li>Tap the <span className="font-semibold">Share</span> button <span role="img" aria-label="share">&#x1f5d2;</span> at the bottom of the screen.</li>
          <li>Scroll down and tap <span className="font-semibold">Add to Home Screen</span>.</li>
          <li>Tap <span className="font-semibold">Add</span> in the top right corner.</li>
        </ol>
        <div className="flex flex-col items-center gap-4">
          <img
            src="/screenshot1.jpg"
            alt="Step 1: Open Share Menu"
            className="w-40 h-80 object-cover rounded-md border"
          />
          <img
            src="/screenshot2.jpg"
            alt="Step 2: Add to Home Screen"
            className="w-40 h-80 object-cover rounded-md border"
          />
        </div>
        <p className="mt-8 text-gray-500 text-sm">Once added, you can launch Testie directly from your home screen like a native app!</p>
      </div>
    </div>
  );
};

export default InstallScreen; 