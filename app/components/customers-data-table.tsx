"use client";

import { useState, useEffect } from "react";
import { Customer, PaginatedResponse } from "@/types/customer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";

export function CustomersDataTable() {
  const [data, setData] = useState<PaginatedResponse<Customer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [gender, setGender] = useState<string>("all");

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, search, gender]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      if (gender !== "all") {
        params.append("gender", gender);
      }

      const response = await fetch(`/api/customers?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.statusText}`);
      }

      const result: PaginatedResponse<Customer> = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleGenderChange = (value: string) => {
    setGender(value);
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value, 10));
    setPage(1);
  };

  const handlePreviousPage = () => {
    if (data?.pagination.hasPrevious) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data?.pagination.hasNext) {
      setPage(page + 1);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Error</p>
          <p className="text-sm text-gray-600">{error}</p>
          <Button onClick={fetchCustomers} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex gap-2">
            <Input
              placeholder="Search customers..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full sm:w-62.5"
            />
            <Button onClick={handleSearch} size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select value={gender} onValueChange={handleGenderChange}>
            <SelectTrigger className="w-full sm:w-37.5">
              <SelectValue placeholder="Filter by gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Title</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.gender}</TableCell>
                    <TableCell>{customer.company}</TableCell>
                    <TableCell>{customer.city}</TableCell>
                    <TableCell>{customer.title}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Page {data?.pagination.page || 0} of{" "}
            {data?.pagination.totalPages || 0} ({data?.pagination.total || 0}{" "}
            total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousPage}
              disabled={!data?.pagination.hasPrevious || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={!data?.pagination.hasNext || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
