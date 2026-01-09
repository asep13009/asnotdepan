
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";
import { useAttendance } from '../../context/AttendanceContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

// Interface untuk data attendance - ubah properti menjadi optional untuk match dengan TodayAttendance dari context
interface AttendanceData {
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

// Interface untuk alert
interface AlertItem {
  variant: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  showLink: boolean;
  linkHref?: string;
  linkText?: string;
}

const AttendanceDataDisplay: React.FC = () => {
  // Gunakan data dari context, bukan state lokal
  const { todayAttendance, loading: contextLoading, error: contextError } = useAttendance();

  // Konversi todayAttendance ke array untuk tabel (handle jika array atau object)
  const attendanceData: AttendanceData[] = todayAttendance ? (Array.isArray(todayAttendance) ? todayAttendance : [todayAttendance]) : [];

  // Handle alerts dari context
  const alerts: AlertItem[] = contextError ? [{ variant: 'error', title: 'Error', message: contextError, showLink: false }] : [];

  // Fungsi untuk format tanggal/waktu (opsional, untuk tampilan lebih rapi)
  const formatDateTime = (dateString: string) => {
    if (!dateString) {
      return 'No Check Out'; // Jika kosong, tampilkan string kosong
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return ''; // Jika invalid, tampilkan string kosong
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }); // 'Nov' untuk November
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <>
      <ComponentCard title="Absensi Hari ini">
        {contextLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                variant={alert.variant}
                title={alert.title}
                message={alert.message}
                showLink={alert.showLink}
                linkHref={alert.linkHref}
                linkText={alert.linkText}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Check In</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Check Out</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Photo In</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Photo Out</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {attendanceData.map((item, index) => (
                    <TableRow key={item.id || index} className="hover:bg-gray-50">
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.date || ''}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatDateTime(item.checkIn || '')}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatDateTime(item.checkOut || '')}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {item.photo_in ? (
                          <img src={`data:image/jpeg;base64,${item.photo_in}`}  alt="Photo In" className="w-16 h-16 object-cover rounded" />
                          // <img src={item.photo_in} alt="Photo In" className="w-16 h-16 object-cover rounded" />
                        ) : (
                          'No Photo'
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {item.photo_out ? (
                          <img src={`data:image/jpeg;base64,${item.photo_out}`} alt="Photo Out" className="w-16 h-16 object-cover rounded" />
                        ) : (
                          'No Photo'
                        )}
                      </TableCell>
                      <TableCell className={`px-4 py-3 text-center text-theme-sm font-semibold ${
                        item.status === 'LATE' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {item.status || ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {attendanceData.length === 0 && (
              <div className="text-center py-4 text-gray-500">No attendance data available.</div>
            )}
          </div>
        )}
      </ComponentCard>
    </>
  );
};

export default AttendanceDataDisplay;
