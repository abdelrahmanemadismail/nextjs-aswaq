"use client";

import React, { useCallback, useEffect, useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAdminUsers, updateUserStatus, updateVerificationStatus } from '@/actions/admin-actions';
import { AdminUser } from '@/types/admin';
import { Ban, Check, MoreHorizontal, Search, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { users: fetchedUsers, total } = await getAdminUsers(page);
      setUsers(fetchedUsers);
      setTotalUsers(total);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUpdateStatus = async (userId: string, isBanned: boolean) => {
    try {
      setProcessing(userId);
      await updateUserStatus(userId, isBanned);
      await loadUsers();
      toast({
        title: "Success",
        description: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateVerification = async (userId: string, status: 'unverified' | 'pending' | 'verified') => {
    try {
      setProcessing(userId);
      await updateVerificationStatus(userId, status);
      await loadUsers();
      toast({
        title: "Success",
        description: "Verification status updated successfully",
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500"><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary"><ShieldAlert className="mr-1 h-3 w-3" />Pending</Badge>;
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, verification status, and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {user.user_roles?.role?.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getVerificationBadge(user.verification_status)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.join_date), 'PP')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              disabled={processing === user.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(user.id, !user.is_banned)}
                            >
                              {user.is_banned ? (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Unban User
                                </>
                              ) : (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Ban User
                                </>
                              )}
                            </DropdownMenuItem>
                            {user.verification_status !== 'verified' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateVerification(user.id, 'verified')}
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Verify User
                              </DropdownMenuItem>
                            )}
                            {user.verification_status === 'verified' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateVerification(user.id, 'unverified')}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Revoke Verification
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {users.length} of {totalUsers} users
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={users.length < 10 || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}