import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';

// Interface untuk data attendance hari ini (dari API) - match dengan AttendanceData di komponen
interface TodayAttendance {
  id?: number;
  checkIn?: string;
  checkOut?: string;
  date?: string;
  latitude_in?: number;
  longitude_in?: number;
  latitude_out?: number;
  longitude_out?: number;
  photo_in?: string;
  photo_out?: string;
  status?: string;
}

interface AttendanceContextType {
  todayAttendance: TodayAttendance | null;
  loading: boolean;
  error: string | null;
  refreshTrigger: number;
  triggerRefresh: () => void;
  fetchTodayAttendance: () => Promise<void>; // Fungsi untuk fetch manual jika perlu
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [currentToken, setCurrentToken] = useState<string | null>(null); // State untuk track token
  
  const [imageSrc, setImageSrc] = useState<string[]>([]); 
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const fetchTodayAttendance = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please log in.');
      setTodayAttendance(null); // Reset data jika tidak ada token
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Revoke previous object URLs to prevent memory leaks
      setImageSrc(currentUrls => {
        currentUrls.forEach(url => URL.revokeObjectURL(url));
        return [];
      });

      const response = await axios.get(`${BASE_URL}/api/attendance/data-harian`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },

      }); 
      let data = response.data || null;  
      setTodayAttendance(data); 
    } catch (err: any) {
      console.error('Error fetching today attendance:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data.');
      setTodayAttendance(null); // Reset data jika error
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch otomatis saat mount atau refreshTrigger berubah
  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance, refreshTrigger]);

  // useEffect untuk mendeteksi perubahan token (misalnya setelah login)
  useEffect(() => {
    const checkTokenChange = () => {
      const token = localStorage.getItem('token');
      if (token !== currentToken) {
        setCurrentToken(token);
        if (token) {
          fetchTodayAttendance(); // Fetch ulang jika token baru
        } else {
          setTodayAttendance(null); // Reset jika token hilang
          setError('No token found. Please log in.');
        }
      }
    };

    // Cek token saat mount
    checkTokenChange();

    // Interval untuk cek perubahan token setiap 1 detik (opsional, tapi efektif untuk deteksi login/logout)
    const interval = setInterval(checkTokenChange, 1000);

    return () => clearInterval(interval); // Cleanup
  }, [currentToken, fetchTodayAttendance]);

  return (
    <AttendanceContext.Provider value={{
      todayAttendance,
      loading,
      error,
      refreshTrigger,
      triggerRefresh,
      fetchTodayAttendance,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }
  return context;
};
