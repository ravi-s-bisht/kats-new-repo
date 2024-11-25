import React, { useState, useEffect } from "react";
import { TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  TextField,
  CircularProgress,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { utc } from "moment";
import dayutc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(dayutc);
dayjs.extend(timezone);

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export interface Medication {
  id?: number;
  medication_name: string;
  reminder_time: string;
}

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  medications: Medication[];
}

interface UserTableProps {
  users: User[];
  onAddMedication: (userId: string, medication: Medication) => void;
  onDeleteMedication: (userId: string, medicationIndex: number) => void;
  onUpdateUsers: () => void;
  isLoading: boolean;
  setIsLoading: any;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onAddMedication,
  onDeleteMedication,
  onUpdateUsers,
  isLoading,
  setIsLoading,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddMedicationModal, setShowAddMedicationModal] =
    useState<boolean>(false);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [medicationName, setMedicationName] = useState<string>("");
  const [medicationTime, setMedicationTime] = useState<Dayjs>(dayjs());
  const [newUserName, setNewUserName] = useState<string>("");
  const [newLastName, setNewLastName] = useState<string>("");
  const [newUserPhone, setNewUserPhone] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string>("");

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      // Update users through parent component
      // You'll need to add this prop to UserTableProps and handle it in the parent
      onUpdateUsers();
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddMedicationModal = (user: User) => {
    console.log("my userrrr: ", user);
    setSelectedUser(user);
    setShowAddMedicationModal(true);
  };

  const handleAddMedication = async () => {
    setIsLoading(true);
    if (selectedUser && medicationName) {
      try {
        const response = await fetch("/api/medications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: selectedUser.id,
            medication_name: medicationName,
            reminder_time: medicationTime
              .tz("America/Los_Angeles")
              .format("HH:mm:00"),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to add medication");
        }

        onAddMedication(selectedUser.id, {
          medication_name: medicationName,
          reminder_time: medicationTime
            .tz("America/Los_Angeles")
            .format("HH:mm:00"),
        });

        setMedicationName("");
        setMedicationTime(dayjs().tz("America/Los_Angeles"));
        setShowAddMedicationModal(false);
        setSelectedUser(null);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\+\d+$/; // Matches +[any number of digits]
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewUserPhone(value);

    if (value && !validatePhoneNumber(value)) {
      setPhoneError("Please follow this format: +12345678901");
    } else {
      setPhoneError("");
    }
  };

  const handleAddUser = async () => {
    if (!validatePhoneNumber(newUserPhone)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }
    setIsLoading(true);
    if (newUserName && newUserPhone) {
      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: newUserName,
            last_name: newLastName,
            phone_number: newUserPhone,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to add user");
        }

        fetchUsers();

        setNewUserName("");
        setNewLastName("");
        setNewUserPhone("");
        setShowAddUserModal(false);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
        setIsLoading(false);
      }
    }
  };

  const handleDeleteMedication = async (
    userId: string,
    medication_id: number
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/medications`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: medication_id,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete medication");

      setSelectedUser(null);

      onDeleteMedication(userId, medication_id);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to delete medication");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleUserDelete = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      // Refresh the users list
      await fetchUsers();
      setIsLoading(false);
    } catch (err) {
      setError("Failed to delete user");
      console.error(err);
      setIsLoading(false);
    }
  };

  const onChangeMedicationTime = (newValue: any) => {
    console.log("selected time: ", newValue);
    setMedicationTime(newValue || dayjs().tz("America/Los_Angeles"));
  };

  return (
    <div>
      {/* Add User Button */}
      <div className="mb-4 flex justify-between">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Users</h1>
        </div>
        {/* <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => setShowAddUserModal(true)}
        >
          Add User
        </button> */}
        <LoadingButton
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddUserModal(true)}
        >
          Add User
        </LoadingButton>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6 space-y-5">
            <h2 className="text-xl font-bold mb-4">Add User</h2>
            {/* <div className="mb-4">
              <label className="block text-sm text-left font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div> */}
            <TextField
              required
              id="outlined-required"
              label="First Name"
              placeholder="First Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              size="small"
              className="w-full"
            />
            <TextField
              required
              id="outlined-required"
              label="Last Name"
              placeholder="Last Name"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
              size="small"
              className="w-full"
            />
            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-left text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div> */}
            <TextField
              required
              type="tel"
              id="outlined-required"
              label="Phone Number"
              placeholder="+12345678901"
              value={newUserPhone}
              onChange={handlePhoneChange}
              error={!!phoneError}
              helperText={phoneError}
              size="small"
              className="w-full"
            />
            <div className="flex justify-end gap-4 pt-5">
              {/* <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                onClick={() => setShowAddUserModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleAddUser}
              >
                Add
              </button> */}
              <Button
                onClick={() => {
                  setNewUserName("");
                  setNewLastName("");
                  setNewUserPhone("");
                  setShowAddUserModal(false);
                }}
                variant="contained"
                color="inherit"
              >
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                loading={isLoading}
                onClick={handleAddUser}
                disabled={!!phoneError}
              >
                Add
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-lg">
          <thead className="border border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-700">
                Name
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-700">
                Phone No.
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center px-6 py-8">
                  <CircularProgress />
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-6 py-4 flex items-center justify-start">
                    <Avatar className="mr-3">{user.name[0]}</Avatar>
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-left">{user.phoneNumber}</td>
                  <td className="px-6 py-4 flex gap-4">
                    <LoadingButton
                      startIcon={<AddIcon />}
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => openAddMedicationModal(user)}
                    >
                      Medication
                    </LoadingButton>
                    <LoadingButton
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => setSelectedUser(user)}
                    >
                      Show Medications
                    </LoadingButton>
                    <LoadingButton
                      startIcon={<DeleteIcon />}
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => handleUserDelete(user.id)}
                    >
                      User
                    </LoadingButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center px-6 py-8 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add Medication Modal */}
        {showAddMedicationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-[400px] p-6 space-y-5">
              <h2 className="text-2xl font-bold mb-4">Add Medication</h2>
              {/* <div className="mb-4">
                <label className="block text-sm text-left font-medium text-gray-700">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div> */}
              <TextField
                required
                type="tel"
                id="outlined-required"
                label="Medication Name"
                placeholder="Medication Name"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                size="small"
                className="w-full"
              />
              <TimePicker
                label="Remider Time"
                className="w-full"
                value={medicationTime}
                onChange={(newValue) => onChangeMedicationTime(newValue)}
                timezone="America/Los_Angeles"
              />
              <div className="flex justify-end gap-4 pt-4">
                {/* <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  onClick={() => setShowAddMedicationModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={handleAddMedication}
                >
                  Add
                </button> */}
                <Button
                  onClick={() => {
                    setShowAddMedicationModal(false);
                    setSelectedUser(null);
                    setMedicationName("");
                    setMedicationTime(dayjs());
                  }}
                  variant="contained"
                  color="inherit"
                >
                  Cancel
                </Button>
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  onClick={handleAddMedication}
                >
                  Add
                </LoadingButton>
              </div>
            </div>
          </div>
        )}

        {/* Medications Modal */}
        {selectedUser && !showAddMedicationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 space-y-6">
              <h2 className="text-xl font-bold mb-6">
                Medications for {selectedUser.name}
              </h2>
              {selectedUser.medications.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-center px-4 py-2 font-medium text-gray-700">
                        Medication
                      </th>
                      <th className="text-center px-4 py-2 font-medium text-gray-700">
                        Reminder Time
                      </th>
                      <th className="text-center px-4 py-2 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.medications.map((medication, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          {medication.medication_name}
                        </td>
                        <td className="px-4 py-2">
                          {medication.reminder_time.slice(0, 5)} PST
                        </td>
                        <td className="px-4 py-2">
                          {/* <button
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            onClick={() =>
                              handleDeleteMedication(
                                selectedUser.id,
                                Number(medication.id)
                              )
                            }
                          >
                            Delete
                          </button> */}
                          <LoadingButton
                            loading={isLoading}
                            variant="contained"
                            color="error"
                            onClick={() =>
                              handleDeleteMedication(
                                selectedUser.id,
                                Number(medication.id)
                              )
                            }
                            size="small"
                          >
                            Delete
                          </LoadingButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No medications added.
                </p>
              )}
              <div className="flex justify-end gap-4 pt-4">
                {/* <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </button> */}
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
