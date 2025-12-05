import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';  
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";
import PageMeta from "../../components/common/PageMeta";
import LiveTime from './LiveTime';
import { useAttendance } from "../../context/AttendanceContext"
import { BASE_URL } from '../../config';

// Interface untuk alert
interface AlertItem {
  variant: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  showLink: boolean;
  linkHref?: string;
  linkText?: string;
}

const AttendanceClock: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);  
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);  
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  const [cameraActive, setCameraActive] = useState<boolean>(true);  
  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null);
  const webcamRef = useRef<Webcam>(null);  

  // Gunakan data dari context, bukan state lokal
  const { todayAttendance,  error: contextError, triggerRefresh } = useAttendance();

  // Ambil hasCheckedInToday dan hasCheckedOutToday dari todayAttendance
  const hasCheckedInToday = !!todayAttendance?.checkIn;
  const hasCheckedOutToday = !!todayAttendance?.checkOut;

  // Handle error dari context sebagai alert
  useEffect(() => {
    if (contextError) {
      setCurrentAlert({
        variant: 'error',
        title: 'Error',
        message: contextError,
        showLink: false,
      });
    }
  }, [contextError]);

  // Fungsi untuk capture foto sebagai Blob (binary)
  const capturePhoto = (): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
      if (webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                setPhoto(reader.result as string);
                setPhotoBlob(blob);
                setCameraActive(false);  
              };
              reader.readAsDataURL(blob);
              resolve(blob);
            } else {
              reject(new Error('Failed to capture photo'));
            }
          }, 'image/jpeg', 0.8);  
        } else {
          reject(new Error('Canvas context not available'));
        }
      } else {
        reject(new Error('Webcam not available'));
      }
    });
  };

  const getLocation = (): Promise<{ lat: string; lon: string } | null> => {
    return new Promise((resolve, reject) => {
      console.log("navigator.geolocation?>>" + navigator.geolocation);
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: true,  
          timeout: 30000,  
          maximumAge: 300000, 
        };
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Latitude:", position.coords.latitude);
            console.log("Longitude:", position.coords.longitude);
            const lat = position.coords.latitude.toString();
            const lon = position.coords.longitude.toString();
            setLatitude(lat);
            setLongitude(lon);
            resolve({ lat, lon });
          },
          (error) => {
            console.error('Geolocation error code:', error.code);
            console.error('Geolocation error message:', error.message);
            let errorMessage = 'Unable to get location.';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please allow location permissions in your browser.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. Please check your GPS signal or try outdoors.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out. Try again or check your GPS signal.';
                break;
              default:
                errorMessage = error.message || 'Unknown location error.';
                break;
            }
            reject(new Error(errorMessage));
          },
          options
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  };
 
  const handleCapturePhoto = async () => {
    try {
      await capturePhoto();
      // Dapatkan lokasi setelah capture photo
      const location = await getLocation();
      console.log("location >>>>> " + location);
      console.log("location >>>>> " + latitude);
      console.log("location >>>>> " + longitude);
      if (!location) {
        setCurrentAlert({
          variant: 'error',
          title: 'Error',
          message: 'Unable to get location.',
          showLink: false
        });
      }
    } catch (error: any) {
      setCurrentAlert({
        variant: 'error',
        title: 'Error',
        message: 'Failed to capture photo or get location.',
        showLink: false
      });
    }
  };
 
  const handleReloadCapture = () => {
    setPhoto(null);
    setPhotoBlob(null);
    setLatitude(null);
    setLongitude(null);
    setCameraActive(true);
  };
 
  const handleCheckIn = async () => {
    await handleSubmit(true);
  };
 
  const handleCheckOut = async () => {
    await handleSubmit(false);
  };
 
  const handleSubmit = async (isCheckIn: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentAlert({
        variant: 'error',
        title: 'Error',
        message: 'No token available.',
        showLink: false
      });
      return;
    }

    if (!photoBlob) {
      setCurrentAlert({
        variant: 'error',
        title: 'Error',
        message: 'Please capture a photo first.',
        showLink: false
      });
      return;
    }

    if (!latitude || !longitude) {
      setCurrentAlert({
        variant: 'error',
        title: 'Error',
        message: 'Location not available. Please try capturing again',
        showLink: false
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Captured Photo Blob:', photoBlob);
      console.log('Location:', { lat: latitude, lon: longitude });

      const formData = new FormData();
      formData.append('photo', photoBlob, 'photo.jpg');
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const endpoint = isCheckIn ? `${BASE_URL}/api/attendance/checkin` : `${BASE_URL}/api/attendance/checkout`;
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response:', response); 
      setCurrentAlert({
        variant: 'success',
        title: 'Success',
        message: response.data.message || `${isCheckIn ? 'Check-in' : 'Check-out'} successful!`,
        showLink: false
      });
   
      setPhoto(null);
      setPhotoBlob(null);
      setLatitude(null);
      setLongitude(null);
      setCameraActive(true);  
      
      if (isCheckIn) {
        // hasCheckedInToday akan diupdate otomatis dari context setelah triggerRefresh
      } else {
        setCameraActive(false);  
      }

      triggerRefresh(); // Trigger refresh di context untuk update data
      
    } catch (error: any) {
      console.error(`${isCheckIn ? 'Check-in' : 'Check-out'} error:`, error);
      let errorMessage = `${isCheckIn ? 'Check-in' : 'Check-out'} failed.`;
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = `Bad Request (400): ${error.response.data.message || 'Invalid data sent.'}`;
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized (401): Please check your token.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server Error (500): Please try again later.';
        } else {
          errorMessage = `Error ${error.response.status}: ${error.response.data.message || error.message}`;
        } 
      } else {
        errorMessage = error.message || 'Network error.';
      }
      setCurrentAlert({
        variant: 'error',
        title: 'Error',
        message: errorMessage,
        showLink: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAlert) {
      const timer = setTimeout(() => {
        setCurrentAlert(null);
      }, 5000); 
      return () => clearTimeout(timer);  
    }
  }, [currentAlert]);
  
  return (
    <>
      <PageMeta
        title="ASNOT"
        description="Attendance clock-in clock-out system"
      />
     
      <div className="space-y-5 sm:space-y-6">
        <center> 

          <ComponentCard title="Actions">
            <h1> <LiveTime /></h1>
             
    
         
          <div className="grid  md:grid-cols-1 gap-1"> 
              <center>
                {cameraActive && !hasCheckedOutToday ? (
                  <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width={320}
                      height={240}
                      className="rounded border"
                  />
                ) : (
                  photo ? (
                    <img src={photo} alt="Captured" className=" h-60 rounded border" />
                  ) : (
                    <div className="h-60 bg-gray-200 rounded border flex items-center justify-center text-gray-500">
                      {hasCheckedOutToday ? 'Attendance completed for today' : 'Camera disabled'}
                    </div>
                  )
                )}
              </center>
              <div className="flex justify-center mt-2">
                {photo ? (
                  <button
                    onClick={handleReloadCapture}
                    className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  cameraActive && !hasCheckedOutToday && (
                    <button
                      onClick={handleCapturePhoto}
                      className="bg-gray-500 text-white w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </button>
                  )
                )}
              </div>
              
            
          </div> 

            <button
              onClick={handleCheckIn}
              disabled={loading || !photo || hasCheckedInToday}
              className="bg-green-500 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
            >
              {loading ? 'WAIT...' : hasCheckedInToday ? 'ALREADY CHECKED IN' : 'CHECK IN'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={loading || !photo || !hasCheckedInToday || hasCheckedOutToday}
              className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'WAIT...' : hasCheckedOutToday ? 'ALREADY CHECKED OUT' : 'CHECK OUT'}
            </button>
          </ComponentCard>
        </center>

       
        {currentAlert && (
              <div className="mt-4">
                <Alert
                  variant={currentAlert.variant}
                  title={currentAlert.title}
                  message={currentAlert.message}
                  showLink={currentAlert.showLink}
                  linkHref={currentAlert.linkHref}
                  linkText={currentAlert.linkText} 
                />
              </div>
            )}
 
        
         
      </div>
    </>
  );
};

export default AttendanceClock;