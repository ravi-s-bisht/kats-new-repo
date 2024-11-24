"use client";

import { useState, useEffect } from "react";
import UserTable from "@/components/dashboard/UserTable";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface Medication {
  id: number;
  name: string;
  time: string;
}

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  medications: Medication[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('fetchinggggggg')
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(
        data.map((user: any) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          phoneNumber: user.phone_number,
          medications: user.medications,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleAddMedication = async (userId: string, medication: any) => {
    try {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          medication_name: medication.medication_name,
          reminder_time: medication.reminder_time,
        }),
      });

      if (!response.ok) throw new Error("Failed to add medication");

      const newMedication = await response.json();

      fetchUsers();

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                medications: [...user.medications, newMedication],
              }
            : user
        )
      );
    } catch (error) {
      console.error("Error adding medication:", error);
      // You might want to add error handling UI here
    }
  };

  const handleDeleteMedication = async (
    userId: string,
    medicationId: number
  ) => {
    try {
      fetchUsers();
    } catch (error) {
      console.error("Error deleting medication:", error);
      // You might want to add error handling UI here
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <UserTable
          users={users}
          onAddMedication={handleAddMedication}
          onDeleteMedication={handleDeleteMedication}
          onUpdateUsers={fetchUsers}
        />
      </div>
    </LocalizationProvider>
  );
}
