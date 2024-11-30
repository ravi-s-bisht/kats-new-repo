"use client";

import { useState, useEffect, useContext } from "react";
import UserTable, { User } from "@/components/dashboard/UserTable";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useRouter } from "next/navigation";
import { checkToken as apiCheckToken } from "@/src/api/api";
import { LoggedInUserContext } from "@/src/contexts/LoggedInUserContext";

interface Medication {
  id: number;
  name: string;
  time: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { loggedInUser, setLoggedInUser } = useContext(LoggedInUserContext);

  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      try {
        console.log("logged in user:", loggedInUser);
        const response = await apiCheckToken();

        console.log("check up on token", response, loggedInUser);

        if (response.status !== 200) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        router.push("/login");
      }
    };

    checkToken();
  }, [router, loggedInUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("fetchinggggggg");
      const response = await fetch("/api/users");
      const data = await response.json();
      console.log("fetched: ", data);
      setUsers(
        data.map((user: any) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          phoneNumber: user.phone_number,
          medications: user.medications,
        })),
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setIsLoading(false);
    }
  };

  const handleAddMedication = async (userId: string, medication: any) => {
    try {
      fetchUsers();
    } catch (error) {
      console.error("Error adding medication:", error);
      // You might want to add error handling UI here
    }
  };

  const handleDeleteMedication = async (
    userId: string,
    medicationId: number,
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
      <div className="p-5">
        {/* <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
        </div> */}
        <UserTable
          users={users}
          onAddMedication={handleAddMedication}
          onDeleteMedication={handleDeleteMedication}
          onUpdateUsers={fetchUsers}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>
    </LocalizationProvider>
  );
}
