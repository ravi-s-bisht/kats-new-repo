import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

import React, { useState } from 'react';
import TimePicker from 'react-time-picker';

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

interface UserTableProps {
  users: User[];
  onAddMedication: (userId: string, medication: Medication) => void;
  onDeleteMedication: (userId: string, medicationIndex: number) => void;
  onAddUser: (user: Omit<User, 'id' | 'medications'>) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onAddMedication,
  onDeleteMedication,
  onAddUser,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState<boolean>(false);
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [medicationName, setMedicationName] = useState<string>('');
  const [medicationTime, setMedicationTime] = useState<string>('10:00');
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserPhone, setNewUserPhone] = useState<string>('');

  const openAddMedicationModal = (user: User) => {
    setSelectedUser(user);
    setShowAddMedicationModal(true);
  };

  const handleAddMedication = () => {
    if (selectedUser && medicationName) {
      onAddMedication(selectedUser.id, { name: medicationName, time: medicationTime });
      setMedicationName('');
      setMedicationTime('10:00');
      setShowAddMedicationModal(false);
    }
  };

  const handleAddUser = () => {
    if (newUserName && newUserPhone) {
      onAddUser({ name: newUserName, phoneNumber: newUserPhone });
      setNewUserName('');
      setNewUserPhone('');
      setShowAddUserModal(false);
    }
  };

  return (
    <div>
      {/* Add User Button */}
      <div className="mb-4 flex justify-end">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => setShowAddUserModal(true)}
        >
          Add User
        </button>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
            <h2 className="text-2xl font-bold mb-4">Add User</h2>
            <div className="mb-4">
              <label className="block text-sm text-left font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-left text-gray-700">Phone Number</label>
              <input
                type="text"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
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
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-center px-6 py-3 font-medium text-gray-700">Name</th>
              <th className="text-center px-6 py-3 font-medium text-gray-700">Phone No.</th>
              <th className="text-left px-6 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.phoneNumber}</td>
                  <td className="px-6 py-4 flex gap-4">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      onClick={() => openAddMedicationModal(user)}
                    >
                      Add Medication
                    </button>
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      onClick={() => setSelectedUser(user)}
                    >
                      Show Medications
                    </button>
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
            <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
              <h2 className="text-2xl font-bold mb-4">Add Medication</h2>
              <div className="mb-4">
                <label className="block text-sm text-left font-medium text-gray-700">Medication Name</label>
                <input
                  type="text"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-left font-medium text-gray-700">Time</label>
                <TimePicker
                  value={medicationTime}
                  onChange={(value) => setMedicationTime(value || '10:00')}
                  className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
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
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medications Modal */}
        {selectedUser && !showAddMedicationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-[500px] p-6">
              <h2 className="text-2xl font-bold mb-4">
                Medications for {selectedUser.name}
              </h2>
              {selectedUser.medications.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="text-center px-4 py-2 font-medium text-gray-700">
                        Medication
                      </th>
                      <th className="text-center px-4 py-2 font-medium text-gray-700">
                        Time
                      </th>
                      <th className="text-center px-4 py-2 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.medications.map((medication, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{medication.name}</td>
                        <td className="px-4 py-2">{medication.time}</td>
                        <td className="px-4 py-2">
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            onClick={() => onDeleteMedication(selectedUser.id, index)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-center py-4">No medications added.</p>
              )}
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
