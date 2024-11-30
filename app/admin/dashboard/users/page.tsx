"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button_old";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pill, Eye } from "lucide-react";
import { getUsers } from "@/src/api/api";

// Mock data for users
const users = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    phone: "123-456-7890",
    email: "john@example.com",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    phone: "098-765-4321",
    email: "jane@example.com",
  },
];

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().regex(/^\+\d{9,15}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
});

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

export default function UsersPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [isShowMedicationsOpen, setIsShowMedicationsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [medications, setMedications] = useState<
    { id: number; name: string; time: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [userss, setUsers] = useState([]);

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
  });

  const medicationForm = useForm<z.infer<typeof medicationSchema>>({
    resolver: zodResolver(medicationSchema),
  });

  const fetchUsers = async () => {
    const res = await getUsers({ token: localStorage.getItem("token") });
    console.log("user fetch: ", res.data);
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onAddUser = (data: z.infer<typeof userSchema>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Adding user:", data);
      setIsLoading(false);
      setIsAddUserOpen(false);
      toast({
        title: "User added successfully",
        description: `${data.firstName} ${data.lastName} has been added to the system.`,
      });
    }, 1000);
  };

  const onAddMedication = (data: z.infer<typeof medicationSchema>) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Adding medication:", data);
      setMedications([...medications, { id: Date.now(), ...data }]);
      setIsLoading(false);
      setIsAddMedicationOpen(false);
      toast({
        title: "Medication added successfully",
        description: `${data.name} has been added to the user's medication list.`,
      });
    }, 1000);
  };

  const onDeleteMedication = (id: number) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMedications(medications.filter((med) => med.id !== id));
      setIsLoading(false);
      toast({
        title: "Medication deleted successfully",
        description: "The medication has been removed from the user's list.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <Form {...userForm}>
              <form
                onSubmit={userForm.handleSubmit(onAddUser)}
                className="space-y-4"
              >
                <FormField
                  control={userForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="w-full text-left">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add User
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {user.firstName} {user.lastName}
                </div>
              </TableCell>
              <TableCell className="text-left">{user.phone}</TableCell>
              <TableCell className="text-left">{user.email}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog
                    open={isAddMedicationOpen}
                    onOpenChange={setIsAddMedicationOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user.id)}
                      >
                        <Pill className="mr-2 h-4 w-4" /> Add Medication
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Add Medication</DialogTitle>
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
                                <FormLabel>
                                  Reminder Time (America/Los_Angeles)
                                </FormLabel>
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
                        onClick={() => setSelectedUser(user.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> Show Medications
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>
                          Medications for{" "}
                          {users.find((u) => u.id === selectedUser)?.firstName}{" "}
                          {users.find((u) => u.id === selectedUser)?.lastName}
                        </DialogTitle>
                      </DialogHeader>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medication Name</TableHead>
                            <TableHead>Reminder Time</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medications.map((medication) => (
                            <TableRow key={medication.id}>
                              <TableCell>{medication.name}</TableCell>
                              <TableCell>{medication.time}</TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    onDeleteMedication(medication.id)
                                  }
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Delete"
                                  )}
                                </Button>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
