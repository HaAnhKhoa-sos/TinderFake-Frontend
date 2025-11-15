import React, { useEffect, useState } from 'react';

export default function LoggingIn({ message = 'Đang xử lý' }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-48">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium text-gray-700">
        {message}{dots}
      </p>
    </div>
  );
}
