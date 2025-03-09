"use client"
import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useVerifications } from '@/hooks/use-verifications';
import { AdminVerificationRequest } from '@/types/verification-admin';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { Loader2, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import { VerificationRequestDialog } from '@/components/admin/VerificationRequestDialog';


interface ActionDialogState {
  type: 'approve' | 'reject' | null;
  open: boolean;
}

export default function VerificationsPage() {
  const {
    requests,
    stats,
    loading,
    page,
    totalPages,
    filters,
    search,
    setPage,
    setFilters,
    setSearch,
    loadData,
    handleApprove,
    handleReject
  } = useVerifications();

  const [selectedRequest, setSelectedRequest] = useState<AdminVerificationRequest | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({ type: null, open: false });
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');


  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAction = async () => {
    if (!selectedRequest || !actionDialog.type) return;

    let success = false;
    if (actionDialog.type === 'approve') {
      success = await handleApprove(selectedRequest.id, adminNotes);
    } else {
      if (!rejectionReason) {
        toast({
          title: "Error",
          description: "Please provide a rejection reason",
          variant: "destructive"
        });
        return;
      }
      success = await handleReject(selectedRequest.id, rejectionReason, adminNotes);
    }

    if (success) {
      setActionDialog({ type: null, open: false });
      setSelectedRequest(null);
      setAdminNotes('');
      setRejectionReason('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="mr-1 h-3 w-3" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Verification Requests</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approved ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.rejected ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>
            Manage and process user verification requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  className="pl-8"
                  value={search.query}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => 
                    setSearch(prev => ({ ...prev, query: e.target.value }))
                  }
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected') => 
                setFilters(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.documentType}
              onValueChange={(value: 'all' | 'id' | 'passport') => 
                setFilters(prev => ({ ...prev, documentType: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="id">ID</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="trade_license">Trade License</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No verification requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id} onClick={() => {
                      setSelectedRequest(request);
                      setIsDetailsDialogOpen(true);
                    }}>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.user?.avatar_url || undefined} />
                          <AvatarFallback>
                            {request.user?.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{request.user?.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {request.document_type.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.verification_status)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.created_at), 'PPp')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {requests.length} verification requests
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
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <VerificationRequestDialog 
  isOpen={isDetailsDialogOpen}
  onClose={() => {
    setIsDetailsDialogOpen(false);
    setSelectedRequest(null);
  }}
  request={selectedRequest}
  onApprove={(request) => {
    setSelectedRequest(request);
    setActionDialog({ type: 'approve', open: true });
    setIsDetailsDialogOpen(false);
  }}
  onReject={(request) => {
    setSelectedRequest(request);
    setActionDialog({ type: 'reject', open: true });
    setIsDetailsDialogOpen(false);
  }}
/>
      {/* Action Dialogs */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => {
        if (!open) {
          setActionDialog({ type: null, open: false });
          setSelectedRequest(null);
          setAdminNotes('');
          setRejectionReason('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'approve' ? 'Approve' : 'Reject'} Verification Request
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'approve'
                ? 'Are you sure you want to approve this verification request?'
                : 'Please provide a reason for rejecting this verification request.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionDialog.type === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  className="min-h-[100px]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog({ type: null, open: false });
                setSelectedRequest(null);
                setAdminNotes('');
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.type === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
            >
              {actionDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}