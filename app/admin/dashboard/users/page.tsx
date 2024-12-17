"use client";

import { useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Eye } from "lucide-react";
import { useUser } from "@/src/contexts/UserContext";
import { createUser, deleteUser, getUsers, updateUser } from "@/src/api/api";
import { withAuth } from "@/components/withAuth";
import { PhoneInput } from "@/components/ui/phone-input";

// Type definitions
type User = {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
};

type NewUser = {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
};

// Mock data
const mockUsers: User[] = [
  {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    phone_number: "+1234567890",
    email: "john.doe@example.com",
  },
  {
    id: 2,
    first_name: "Jane",
    last_name: "Smith",
    phone_number: "+1987654321",
    email: "jane.smith@example.com",
  },
  {
    id: 3,
    first_name: "Alice",
    last_name: "Johnson",
    phone_number: "+1122334455",
    email: "alice.johnson@example.com",
  },
];

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z
    .string()
    .regex(
      /^\+\d{1,3}\d{9,10}$/,
      "Phone number must include a valid country code and 9-10 digits"
    ),
  email: z.string().email("Invalid email address"),
});

function UsersPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>(mockUsers);

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
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

  const onAddUser = async (data: z.infer<typeof userSchema>) => {
    setIsLoading(true);
    try {
      const newUser: NewUser = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phone, // Add country code
        email: data.email,
      };

      await createUser({ ...newUser, admin_id: user?.id });
      fetchUsers();

      toast({
        title: "User added successfully!",
        description:
          "A confirmation email has been sent to the user's email address.",
      });

      setIsAddUserOpen(false);
      userForm.reset();
    } catch (error) {
      console.error("Error adding user: ", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onEditUser = async (data: z.infer<typeof userSchema>) => {
    setIsLoading(true);
    try {
      await updateUser({
        id: isEditingUser?.id,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phone, // Add country code
        email: data.email,
      });
      fetchUsers();
      setIsAddUserOpen(false);
      setIsEditingUser(null);
      userForm.reset();
    } catch (error) {
      console.error("Error editing user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteUser = async (id: number) => {
    setIsLoading(true);
    try {
      await deleteUser({ id });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user: ", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Dialog
          open={isAddUserOpen}
          onOpenChange={(isOpen) => {
            setIsEditingUser(null);
            setIsAddUserOpen(isOpen);
            if (!isOpen) {
              userForm.reset(); // Reset the form when the modal is closed
            }
          }}
        >
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
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email</TableHead>
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
              <TableCell colSpan={4} className="text-center text-gray-500">
                No users
              </TableCell>
            </TableRow>
          ) : (
            // Render users when not loading and the users array is not empty
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
                <TableCell className="text-left">{user.phone_number}</TableCell>
                <TableCell className="text-left">{user.email}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingUser(user);
                        userForm.setValue("firstName", user.first_name);
                        userForm.setValue("lastName", user.last_name);
                        userForm.setValue("phone", user.phone_number);
                        userForm.setValue("email", user.email);
                        setIsAddUserOpen(true);
                      }}
                      disabled={isLoading}
                    >
                      Edit
                    </Button>
                    <Button
                      className="bg-red-600 text-white h-[31px]"
                      variant="destructive"
                      onClick={() => onDeleteUser(user.id)}
                      disabled={isLoading}
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog
        open={isAddUserOpen}
        onOpenChange={(isOpen) => {
          setIsAddUserOpen(isOpen);
          if (!isOpen) {
            console.log("emptyyyyy");
            setIsEditingUser(null);
            userForm.reset(); // Reset the form when the modal is closed
          }
        }}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {isEditingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <Form {...userForm}>
            <form
              onSubmit={
                isEditingUser
                  ? userForm.handleSubmit(onEditUser)
                  : userForm.handleSubmit(onAddUser)
              }
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
                render={({ field }) => {
                  // Extract the number without the country code
                  const formattedPhone = field.value?.startsWith("+1")
                    ? field.value.slice(2).trim()
                    : field.value;

                  return (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="flex items-center border border-input rounded-md px-3">
                          <div className="flex items-center space-x-2 mr-2">
                            <span className="text-sm text-muted-foreground">
                              +1
                            </span>
                          </div>
                          <Input
                            {...field}
                            value={formattedPhone} // Show phone without country code
                            onChange={(e) => {
                              // Handle input changes and add country code back for saving
                              const newValue = e.target.value;
                              field.onChange(`+1${newValue}`); // Save with country code
                            }}
                            placeholder="1234567890"
                            className="border-none flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditingUser ? "Save Changes" : "Add User"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAuth(UsersPage, ["admin"]);
