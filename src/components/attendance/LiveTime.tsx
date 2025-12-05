import { useState, useEffect } from "react";

const LiveTime = () => {
  // State untuk menyimpan waktu saat ini
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Fungsi untuk update waktu
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Set interval untuk update setiap 1 detik (1000 ms)
    const intervalId = setInterval(updateTime, 1000);

    // Cleanup interval saat komponen unmount
    return () => clearInterval(intervalId);
  }, []); // Array kosong berarti hanya dijalankan sekali saat mount

  // Format waktu menjadi HH:MM:SS  const hours = currentTime.getHours().toString().padStart(2, '0');
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  return (
    
    <center><div className="text-gray-700 dark:text-gray-300 text-lg font-medium">
      {formattedTime}
    </div>
    </center>
    
  );
};

export default LiveTime;