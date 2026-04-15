import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { Shield, Search, UserX } from "lucide-react";

// User type
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentRole: string | null;
  verified: boolean;
  createdAt?: string;
  status: 'active' | 'banned';
}

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userToBan, setUserToBan] = useState<User | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.currentRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch real users from localStorage
  useEffect(() => {
    const fetchUsers = () => {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];

      const transformedUsers = storedUsers.map((user: User) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'Not provided',
        currentRole: user.currentRole || null,
        verified: user.verified || false,
        createdAt: user.createdAt || new Date().toISOString(),
        status: user.status || 'active'
      }));

      setUsers(transformedUsers);
      setIsLoading(false);
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and selected tab
  const filterUsers = (role: string | null) => {
    return users.filter(user => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      if (role === 'banned') {
        return matchesSearch && user.status === 'banned';
      } else if (role) {
        return matchesSearch && user.currentRole === role && user.status === 'active';
      } else {
        return matchesSearch && user.status === 'active';
      }
    });
  };

  const handleBanUser = (user: User) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const updatedUsers = storedUsers.map((u: User) =>
      u.id === user.id ? { ...u, status: 'banned' } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === user.id ? { ...u, status: 'banned' } : u
      )
    );

    toast({
      title: "User banned successfully",
      description: `${user.name} has been banned from the platform.`,
    });

    setUserToBan(null);
  };

  const handleUnbanUser = (user: User) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const updatedUsers = storedUsers.map((u: User) =>
      u.id === user.id ? { ...u, status: 'active' } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === user.id ? { ...u, status: 'active' } : u
      )
    );

    toast({
      title: "User unbanned successfully",
      description: `${user.name} has been reinstated to the platform.`,
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center">
            <p>Loading user data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-600">Manage all users across the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-medium">Admin Controls</span>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>User Search</CardTitle>
            <CardDescription>
              Find users by name or email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="borrower">Borrowers</TabsTrigger>
            <TabsTrigger value="lender">Lenders</TabsTrigger>
            <TabsTrigger value="banned">Banned Users</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <UserTable
              users={filterUsers(null)}
              onBanUser={setUserToBan}
              onUnbanUser={handleUnbanUser}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="borrower">
            <UserTable
              users={filterUsers('borrower')}
              onBanUser={setUserToBan}
              onUnbanUser={handleUnbanUser}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="lender">
            <UserTable
              users={filterUsers('lender')}
              onBanUser={setUserToBan}
              onUnbanUser={handleUnbanUser}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="banned">
            <UserTable
              users={filterUsers('banned')}
              onBanUser={setUserToBan}
              onUnbanUser={handleUnbanUser}
              formatDate={formatDate}
              showUnban={true}
            />
          </TabsContent>
        </Tabs>

        {/* Ban User Confirmation Dialog */}
        <AlertDialog open={!!userToBan} onOpenChange={(open) => !open && setUserToBan(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ban User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to ban {userToBan?.name}? They will no longer be able to access the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => userToBan && handleBanUser(userToBan)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Ban User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

interface UserTableProps {
  users: User[];
  onBanUser: (user: User) => void;
  onUnbanUser: (user: User) => void;
  formatDate: (date: string) => string;
  showUnban?: boolean;
}

const UserTable = ({ users, onBanUser, onUnbanUser, formatDate, showUnban = false }: UserTableProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-md">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {user.currentRole ? (
                    <Badge key={user.currentRole} variant="outline" className="capitalize">
                      {user.currentRole}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="capitalize">
                      unassigned
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDate(user.createdAt || '')}</TableCell>
              <TableCell className="text-right">
                {showUnban ? (
                  <Button variant="outline" size="sm" onClick={() => onUnbanUser(user)}>
                    Unban
                  </Button>
                ) : (
                  <Button variant="destructive" size="sm" onClick={() => onBanUser(user)}>
                    <UserX className="h-4 w-4 mr-1" />
                    Ban
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagement;
