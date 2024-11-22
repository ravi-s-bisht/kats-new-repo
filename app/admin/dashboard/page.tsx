"use client";

import { useState } from "react";
import UserTable from "@/components/dashboard/UserTable";

interface Medication {
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
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      phoneNumber: "123-456-7890",
      medications: [{ name: "Paracetamol", time: "10:00AM" }],
    },
    {
      id: "2",
      name: "Jane Doe",
      phoneNumber: "123-456-7890",
      medications: [
        { name: "Levothyroxine", time: "3:00AM" },
        { name: "Lisinopril", time: "5:00PM" },
      ],
    },
  ]);

  const handleAddMedication = (userId: string, medication: any) => {
    // const medicationName = prompt("Enter medication name:");
    // const medicationTime = prompt("Enter medication time (AM/PM):");
    // if (medicationName && medicationTime) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                medications: [
                  ...user.medications,
                  medication
                ],
              }
            : user
        )
      );
    // }
  };

  const handleDeleteMedication = (userId: string, medicationIndex: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              medications: user.medications.filter(
                (_, index) => index !== medicationIndex
              ),
            }
          : user
      )
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>
      <UserTable
        users={users}
        onAddMedication={handleAddMedication}
        onDeleteMedication={handleDeleteMedication}
        onAddUser={(user) => {
            setUsers((prevUsers) => [
              ...prevUsers,
              { id: (prevUsers.length + 1).toString(), ...user, medications: [] },
            ]);
        }}
      />
    </div>
  );
}
