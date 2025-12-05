import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import DatePickerMonthOnly from "../form/date-picker-month-only";

interface AttendanceData {
  id: number;
  userId: number;
  checkIn: string; // ISO string
  checkOut: string | null; // ISO string atau null
  date: string; // e.g., "2025-11-28"
  latitude_in: number;
  longitude_in: number;
  latitude_out: number;
  longitude_out: number;
  photoUrl_in: string;
  photoUrl_out: string;
  status: string; // e.g., "LATE"
}

type SortKey = "date" | "checkIn" | "checkOut" | "location" | "status" | "duration";

export default function HistoryAttendance() {
  const [data, setData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default 5, bisa diubah

  // State untuk filter
  const [filters, setFilters] = useState({
    date: "",
    clockIn: "",
    clockOut: "",
    location: "",
    status: "",
    time: "",
  });
  // State untuk selectedMonth, default ke bulan ini (format YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  // State untuk sorting
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);

  // Ambil token dari localStorage
  const token = localStorage.getItem("token"); // Ganti "token" dengan key yang sesuai jika berbeda

   const fetchData = async (month: string) => {
    setLoading(true);
    try {
      // Konversi selectedMonth (YYYY-MM) ke format DD/MM/YYYY untuk tanggal pertama bulan
       const [year, monthNum] = month.split('-');
      const dateParam = `01/${monthNum}/${year}`; // e.g., "01/12/2025"
      const response = await fetch(`http://localhost:8080/api/history/datas?date=${dateParam}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
       
      const result: AttendanceData[] = await response.json();
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err); // Tambahkan logging untuk debug
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (token) {
      fetchData(selectedMonth);
    } else {
      setError("Token tidak ditemukan. Silakan login kembali.");
      setLoading(false);
    }
  }, [token, selectedMonth]); // Tambahkan selectedMonth sebagai dependency

// Reset currentPage ke 1 ketika itemsPerPage, filters, selectedMonth, atau sortConfig berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, filters, selectedMonth, sortConfig]);
 

  // Fungsi untuk menghitung durasi antara checkIn dan checkOut
  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return ""; // Jika checkOut null, return string kosong
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Fungsi untuk format waktu (HH:MM)
  const formatTime = (isoString: string | null) => {
    if (!isoString) return ""; // Jika null, return string kosong
    const date = new Date(isoString);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  // Data yang difilter dan disortir
  const processedData = useMemo(() => {
    let filtered = data.filter((item) => {
      const dateMatch = item.date.toLowerCase().includes(filters.date.toLowerCase());
      const clockInMatch = formatTime(item.checkIn).toLowerCase().includes(filters.clockIn.toLowerCase());
      const clockOutMatch = formatTime(item.checkOut).toLowerCase().includes(filters.clockOut.toLowerCase());
      const locationMatch = `${item.latitude_in}, ${item.longitude_in}`.toLowerCase().includes(filters.location.toLowerCase());
      const statusMatch = filters.status === "" || item.status.toLowerCase() === filters.status.toLowerCase();
      const timeMatch = calculateDuration(item.checkIn, item.checkOut).toLowerCase().includes(filters.time.toLowerCase());
      return dateMatch && clockInMatch && clockOutMatch && locationMatch && statusMatch && timeMatch;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        switch (sortConfig.key) {
          case "date":
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case "checkIn":
            aValue = new Date(a.checkIn);
            bValue = new Date(b.checkIn);
            break;
          case "checkOut":
            aValue = a.checkOut ? new Date(a.checkOut) : null;
            bValue = b.checkOut ? new Date(b.checkOut) : null;
            break;
          case "location":
            aValue = `${a.latitude_in}, ${a.longitude_in}`;
            bValue = `${b.latitude_in}, ${b.longitude_in}`;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "duration":
            aValue = a.checkOut ? new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime() : 0;
            bValue = b.checkOut ? new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime() : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, filters, sortConfig]);

  // Hitung total halaman berdasarkan processedData
  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // Data untuk halaman saat ini
  const currentData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fungsi untuk handle perubahan halaman
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Fungsi untuk handle perubahan itemsPerPage
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
  };

  // Fungsi untuk handle perubahan filter
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Fungsi untuk handle sorting
  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Dapatkan opsi status unik
  const statusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(data.map((item) => item.status)));
    return uniqueStatuses;
  }, [data]);

  // Fungsi untuk render ikon sort
  const renderSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ); // Ikon default (panah atas bawah)
    }
    if (sortConfig.direction === "asc") {
      return (
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      ); // Panah atas
    }
    return (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ); // Panah bawah
  };

  // Memoized onChange handler for DatePickerMonthOnly
  const handleMonthChange = useCallback((dates: Date[]) => {
    if (dates.length > 0) {
      const date = dates[0];
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`);
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Selector untuk items per page */}
       <div className="flex justify-between items-center p-4">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 p-4 w-full max-w-md">
           <DatePickerMonthOnly
            id="date-picker-month-only"
            placeholder="Select a month"
           defaultDate={new Date(selectedMonth + '-01')}
            onChange={handleMonthChange}
          />
           {/* <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              // Opsional: Trigger fetch ulang jika diperlukan
              fetchData(selectedMonth);
            }}
          >
            Search
          </button> */}
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-500"> 
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Filter Row */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell className="px-5 py-3">
                <input
                  type="text"
                  placeholder="Filter Date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange("date", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </TableCell>
              <TableCell className="px-5 py-3">
                <input
                  type="text"
                  placeholder="Filter Clock IN"
                  value={filters.clockIn}
                  onChange={(e) => handleFilterChange("clockIn", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </TableCell>
              <TableCell className="px-5 py-3">
                <input
                  type="text"
                  placeholder="Filter Clock OUT"
                  value={filters.clockOut}
                  onChange={(e) => handleFilterChange("clockOut", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </TableCell>
              <TableCell className="px-5 py-3">
                <input
                  type="text"
                  placeholder="Filter Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </TableCell>
              <TableCell className="px-5 py-3">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">All Status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell className="px-5 py-3">
                <input
                  type="text"
                  placeholder="Filter Time"
                  value={filters.time}
                  onChange={(e) => handleFilterChange("time", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date {renderSortIcon("date")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("checkIn")}
              >
                Clock IN {renderSortIcon("checkIn")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("checkOut")}
              >
                Clock OUT {renderSortIcon("checkOut")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("location")}
              >
                LOKASI {renderSortIcon("location")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status {renderSortIcon("status")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("duration")}
              >
                Time {renderSortIcon("duration")}
              </th>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {currentData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {item.date}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {formatTime(item.checkIn)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {formatTime(item.checkOut)}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {`${item.latitude_in}, ${item.longitude_in}`} {/* Atau gunakan reverse geocoding jika perlu alamat */}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      item.status === "LATE"
                        ? "warning"
                        : item.status === "ONTIME" || item.status === "PRESENT"
                        ? "success"
                        : "error" // Sesuaikan berdasarkan status lainnya
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {calculateDuration(item.checkIn, item.checkOut)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
