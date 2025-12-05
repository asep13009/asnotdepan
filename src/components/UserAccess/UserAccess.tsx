import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { BASE_URL } from "../../config";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string | null;
}

type SortKey = "id" | "username" | "name" | "email" | "role";

export default function UserAccess() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default 5, bisa diubah

  // State untuk filter
  const [filters, setFilters] = useState({
    id: "",
    username: "",
    name: "",
    email: "",
    role: "",
  });

  // State untuk sorting
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset currentPage ke 1 ketika itemsPerPage, filters, atau sortConfig berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, filters, sortConfig]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/user/all-user`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    if (user.role === null) {
      setEditingId(user.id);
      setSelectedRole("");
    }
  };

  const handleSave = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/user/set-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(users.map(u => u.id === user.id ? result.user : u));
        setEditingId(null);
        setSelectedRole("");
      } else {
        console.error("Error updating role");
      }
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setSelectedRole("");
  };

  // Data yang difilter dan disortir
  const processedData = useMemo(() => {
    let filtered = users.filter((user) => {
      const idMatch = filters.id === "" || user.id.toString().includes(filters.id);
      const usernameMatch = user.username.toLowerCase().includes(filters.username.toLowerCase());
      const nameMatch = user.name.toLowerCase().includes(filters.name.toLowerCase());
      const emailMatch = user.email.toLowerCase().includes(filters.email.toLowerCase());
      const roleMatch = filters.role === "" || (user.role || "").toLowerCase() === filters.role.toLowerCase();
      return idMatch && usernameMatch && nameMatch && emailMatch && roleMatch;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        switch (sortConfig.key) {
          case "id":
            aValue = a.id;
            bValue = b.id;
            break;
          case "username":
            aValue = a.username.toLowerCase();
            bValue = b.username.toLowerCase();
            break;
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "email":
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case "role":
            aValue = (a.role || "").toLowerCase();
            bValue = (b.role || "").toLowerCase();
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
  }, [users, filters, sortConfig]);

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

  // Dapatkan opsi role unik
  const roleOptions = useMemo(() => {
    const uniqueRoles = Array.from(new Set(users.map((user) => user.role).filter(Boolean)));
    return uniqueRoles;
  }, [users]);

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
                onClick={() => handleSort("username")}
              >
                Username {renderSortIcon("username")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name {renderSortIcon("name")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email {renderSortIcon("email")}
              </th>
              <th
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer"
                onClick={() => handleSort("role")}
              >
                Role {renderSortIcon("role")}
              </th>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
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
                  placeholder="Filter Username"
                  value={filters.username}
                  onChange={(e) => handleFilterChange("username", e.target.value)}
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
                  placeholder="Filter Email"
                  value={filters.email}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </TableCell>
              <TableCell className="px-5 py-3">
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">All Roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} >
                      {role}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell className="px-5 py-3">
                <span></span>
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {currentData.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {user.id}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.username}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.email}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {editingId === user.id ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">Select Role</option>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    <Badge
                      size="sm"
                      color={
                        user.role === "ADMIN"
                          ? "success"
                          : user.role === "USER"
                          ? "warning"
                          : "error"
                      }
                    >
                      {user.role || "NULL"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {editingId === user.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(user)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    user.role === null && (
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    )
                  )}
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
