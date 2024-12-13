"use client";

import { useState, useEffect } from "react";
import { withAuth } from "@/components/withAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Users,
  Video,
  Headphones,
  Bell,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/src/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

type Stats = {
  users: number;
  videoConversations: number;
  audioConversations: number;
  reminders: number;
};

type ReminderHistoryItem = {
  id: number;
  full_name: string;
  medicine: string;
  time_set: string;
  reminded_at: string;
};

function DashboardPage() {
  const [dateRange, setDateRange] = useState<
    "all" | "1d" | "7d" | "30d" | "custom"
  >("7d");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date(),
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [reminderHistory, setReminderHistory] = useState<ReminderHistoryItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [dateRange, customDateRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let url = `/api/dashboard/stats?timeRange=${dateRange}&admin_id=${user?.id}`;
      if (
        dateRange === "custom" &&
        customDateRange.from &&
        customDateRange.to
      ) {
        url += `&startDate=${customDateRange.from.toISOString()}&endDate=${customDateRange.to.toISOString()}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      setStats(data.stats);
      setReminderHistory(data.reminderHistory);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatsRefresh = () => {
    fetchData();
  };

  function formatTimeToAMPM(timeSet: any) {
    // Split the time string into hours, minutes, and seconds
    const timeParts = timeSet.split(":");

    // Create a new Date object using the current date
    const date = new Date();

    // Set the hours, minutes, and seconds based on the input time
    date.setHours(timeParts[0], timeParts[1], timeParts[2]);

    // Format the time to AM/PM
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatToDateTimeAMPM(timeString: any) {
    const date = new Date(timeString);

    // Format the date and time in 'America/Los_Angeles' timezone with AM/PM
    const formattedDate = date.toLocaleString("en-US", {
      weekday: "long", // Day of the week (e.g., "Monday")
      year: "numeric", // Full year
      month: "long", // Full month name (e.g., "July")
      day: "numeric", // Day of the month (e.g., "4")
      hour: "2-digit", // Hour in 2-digit format
      minute: "2-digit", // Minute in 2-digit format
      hour12: true, // AM/PM format
      timeZone: "America/Los_Angeles", // Ensure it's in Los Angeles timezone
    });

    return formattedDate;
  }

  return (
    <div className="space-y-6">
      {/* <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">MediTrack Analytics</h1>
        </div>
      </header> */}

      <main className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Dashboard Overview
          </h2>
          <div className="flex items-center space-x-4">
            <Button onClick={handleStatsRefresh} variant="outline">
              <RefreshCw />
              Refresh
            </Button>
            <Select
              value={dateRange}
              onValueChange={(value: any) => setDateRange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="1d">Past 24 hours</SelectItem>
                <SelectItem value="7d">Past 7 days</SelectItem>
                <SelectItem value="30d">Past 30 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            {dateRange === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, "LLL dd, y")} -{" "}
                          {format(customDateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(customDateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="end">
                  <Calendar
                    mode="range"
                    selected={customDateRange}
                    onSelect={(range) => {
                      setCustomDateRange(
                        range as { from: Date; to: Date | undefined }
                      );
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.users.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">Registered accounts</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Video Conversations
              </CardTitle>
              <Video className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.videoConversations.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">Total video calls</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Audio Conversations
              </CardTitle>
              <Headphones className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.audioConversations.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">Total audio calls</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Reminders
              </CardTitle>
              <Bell className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.reminders.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">Sent reminders</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Reminder History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Medicine</TableHead>
                  {/* <TableHead>Time Set</TableHead> */}
                  <TableHead>Reminded At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        {/* <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell> */}
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : reminderHistory.length > 0 ? (
                  reminderHistory.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium text-left">
                        {reminder.id}
                      </TableCell>
                      <TableCell className="text-left">
                        {reminder.full_name}
                      </TableCell>
                      <TableCell className="text-left">
                        {reminder.medicine}
                      </TableCell>
                      {/* <TableCell className="text-left">
                        {formatTimeToAMPM(reminder.time_set)}
                      </TableCell> */}
                      <TableCell className="text-left">
                        {formatToDateTimeAMPM(reminder.reminded_at)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No reminder history available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(DashboardPage, ["admin"]);
