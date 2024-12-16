"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Plus, Pill, Eye, Edit } from "lucide-react";
import {
  addMedication,
  deleteMedication,
  getUsers,
  updateMedication,
} from "@/src/api/api";
import { useUser } from "@/src/contexts/UserContext";
import { withAuth } from "@/components/withAuth";
import Link from "next/link";

// Type definitions
type Medication = {
  id: number;
  medication_name: string;
  reminder_time: string;
};

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  medications: Medication[];
};

// Mock data (this should be fetched from your API in a real application)
const mockUsers: User[] = [
  {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone_number: "+1234567890",
    medications: [
      { id: 1, medication_name: "Aspirin", reminder_time: "08:00:00" },
      { id: 2, medication_name: "Vitamin C", reminder_time: "20:00:00" },
    ],
  },
  {
    id: 2,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@example.com",
    phone_number: "+1987654321",
    medications: [
      { id: 3, medication_name: "Ibuprofen", reminder_time: "14:00:00" },
    ],
  },
];

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

function RemindersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [isEditMedicationOpen, setIsEditMedicationOpen] = useState(false);
  const [isShowMedicationsOpen, setIsShowMedicationsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const medicationForm = useForm<z.infer<typeof medicationSchema>>({
    resolver: zodResolver(medicationSchema),
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    if (!user) return;
    const res = await getUsers({ admin_id: user.id });
    setUsers(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onAddMedication = async (data: z.infer<typeof medicationSchema>) => {
    if (!selectedUser) return;
    setIsLoading(true);
    try {
      await addMedication({
        user_id: selectedUser.id,
        medication_name: data.name,
        reminder_time: data.time,
      });
      medicationForm.reset();
      setIsAddMedicationOpen(false);
      fetchUsers();
      setIsLoading(false);
    } catch (error) {
      console.error("Error adding medication: ", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onEditMedication = async (data: z.infer<typeof medicationSchema>) => {
    if (!selectedUser || !selectedMedication) return;
    setIsLoading(true);
    try {
      // Simulate API call
      await updateMedication({
        id: selectedMedication.id,
        user_id: selectedUser.id,
        medication_name: data.name,
        reminder_time: data.time + ":00",
      });
      setIsEditMedicationOpen(false);
      // setIsShowMedicationsOpen(false);
      setIsLoading(false);
      medicationForm.reset();
      fetchUsers();
    } catch (error) {
      console.error("Error editing medication: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteMedication = async (userId: number, medicationId: number) => {
    setIsLoading(true);
    try {
      await deleteMedication({ user_id: userId, medication_id: medicationId });
      setIsLoading(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting medication: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reminders</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Show loader when isLoading is true
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <Loader2 className="mt-6 h-16 w-16 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            // Show "No users" when the users array is empty
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500 mt-7">
                <div className="flex flex-col space-y-5 justify-center items-center">
                  Please add users to start adding reminders. <br />
                  <Link href="/admin/dashboard/users">
                    <Button variant="default">Go to Users</Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {/* <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>
                        {user.first_name[0]}
                        {user.last_name[0]}
                      </AvatarFallback>
                    </Avatar> */}
                    {user.first_name} {user.last_name}
                  </div>
                </TableCell>
                <TableCell className="text-left">{user.email}</TableCell>
                <TableCell className="text-left">{user.phone_number}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog
                      open={isAddMedicationOpen}
                      onOpenChange={(isOpen) => {
                        setIsAddMedicationOpen(isOpen);
                        if (!isOpen) {
                          setSelectedUser(null);
                          medicationForm.reset();
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Medication
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white">
                        <DialogHeader>
                          <DialogTitle>
                            Add Medication for {user.first_name}{" "}
                            {user.last_name}
                          </DialogTitle>
                        </DialogHeader>
                        <Form {...medicationForm}>
                          <form
                            onSubmit={medicationForm.handleSubmit(
                              onAddMedication
                            )}
                            className="space-y-4"
                          >
                            <FormField
                              control={medicationForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Medication Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={medicationForm.control}
                              name="time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reminder Time</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="time" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" disabled={isLoading}>
                              {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Add Medication
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={isShowMedicationsOpen}
                      onOpenChange={setIsShowMedicationsOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Show Medications
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl bg-white">
                        <DialogHeader>
                          <DialogTitle>
                            Medications for {user.first_name} {user.last_name}
                          </DialogTitle>
                        </DialogHeader>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Medication Name</TableHead>
                              <TableHead>Reminder Time</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {user.medications.map((medication) => (
                              <TableRow key={medication.id}>
                                <TableCell>
                                  {medication.medication_name}
                                </TableCell>
                                <TableCell>
                                  {medication.reminder_time.slice(0, -3)} PST
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedMedication(medication);
                                        medicationForm.reset({
                                          name: medication.medication_name,
                                          time: medication.reminder_time.slice(
                                            0,
                                            -3
                                          ),
                                        });
                                        setIsEditMedicationOpen(true);
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="bg-red-700 text-white"
                                      onClick={() =>
                                        onDeleteMedication(
                                          user.id,
                                          medication.id
                                        )
                                      }
                                      disabled={isLoading}
                                    >
                                      {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        "Delete"
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog
        open={isEditMedicationOpen}
        onOpenChange={setIsEditMedicationOpen}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
          </DialogHeader>
          <Form {...medicationForm}>
            <form
              onSubmit={medicationForm.handleSubmit(onEditMedication)}
              className="space-y-4"
            >
              <FormField
                control={medicationForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={medicationForm.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Medication
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAuth(RemindersPage, ["admin"]);
