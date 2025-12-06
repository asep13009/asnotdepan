import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Badge from "../components/ui/badge/Badge";
import { BASE_URL } from "../config";
import axios from "axios";

interface RekapData {
  id: number;
  name: string;
  date: string;
  status: string;
  hours: number;
}

type SortKey = "id" | "name" | "date" | "status" | "hours";

export default function Rekap() {
  const [data, setData] = useState<RekapData[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // State untuk filter
  const [filters, setFilters] = useState({
    id: "",
    name: "",
    date: "",
    status: "",
    hours: "",
  });

  // State untuk sorting
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);

  useEffect(() => {
    fetchRekapData();
  }, []);

  // Reset currentPage ke 1 ketika itemsPerPage, filters, atau sortConfig berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, filters, sortConfig]);

  const fetchRekapData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${BASE_URL}/api/rekap/all`, // Assuming API endpoint
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'ngrok-skip-browser-warning': 'true',
        },
      };

      const response = await axios.request(config);
      console.log("rekap data " + JSON.stringify(response.data));
      setData(response.data);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
      // Fallback to dummy data if API fails
      setData([
        { id: 1, name: "John Doe", date: "2023-10-01", status: "Present", hours: 8 },
        { id: 2, name: "Jane Smith", date: "2023-10-01", status: "Absent", hours: 0 },
        { id: 3, name: "Bob Johnson", date: "2023-10-02", status: "Present", hours: 7.5 },
        // Add more dummy data as needed
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Data yang difilter dan disortir
  const processedData = useMemo(() => {
    let filtered = data.filter((item) => {
      const idMatch = filters.id === "" || item.id.toString().includes(filters.id);
      const nameMatch = item.name.toLowerCase().includes(filters.name.toLowerCase());
      const dateMatch = item.date.toLowerCase().includes(filters.date.toLowerCase());
      const statusMatch = filters.status === "" || item.status.toLowerCase().includes(filters.status.toLowerCase());
      const hoursMatch = filters.hours === "" || item.hours.toString().includes(filters.hours);
      return idMatch && nameMatch && dateMatch && statusMatch && hoursMatch;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        switch (sortConfig.key) {
          case "id":
            aValue = a.id;
            bValue = b.id;
            break;
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "date":
            aValue = a.date;
            bValue = b.date;
            break;
          case "status":
            aValue = a.status.toLowerCase();
            bValue = b.status.toLowerCase();
            break;
          case "hours":
            aValue = a.hours;
            bValue = b.hours;
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

  // Fungsi untuk download data
  const handleDownload = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + processedData.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rekap_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      );
    }
    if (sortConfig.direction === "asc") {
      return (
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Rekap Data</h1>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Download Data
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("id")}
              >
                ID {renderSortIcon("id")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name {renderSortIcon("name")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date {renderSortIcon("date")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status {renderSortIcon("status")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("hours")}
              >
                Hours {renderSortIcon("hours")}
              </th>
            </TableRow>
          </TableHeader>

          {/* Filter Row */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell className="px-5 py-3">
                <input
                  type="text"
                  placeholder="Filter ID"
                  value={filters.id}
                  onChange={(e) => handleFilterChange("id", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </TableCell>
              <TableCell className="px-5 py-3">
                <input
                  type="text"
                  placeholder="Filter Name"
                  value={filters.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </TableCell>
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
                  placeholder="Filter Hours"
                  value={filters.hours}
                  onChange={(e) => handleFilterChange("hours", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {currentData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {item.id}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {item.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {item.date}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      item.status === "Present"
                        ? "success"
                        : item.status === "Absent"
                        ? "error"
                        : "warning"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {item.hours}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.05]">
        <div className="flex items-center space-x-2">
          <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
