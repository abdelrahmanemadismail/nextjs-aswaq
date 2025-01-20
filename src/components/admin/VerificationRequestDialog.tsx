// VerificationRequestDialog.tsx

"use client"
import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminVerificationRequest } from '@/types/verification-admin';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface VerificationRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: AdminVerificationRequest | null;
  onApprove?: (request: AdminVerificationRequest) => void;
  onReject?: (request: AdminVerificationRequest) => void;
}

export function VerificationRequestDialog({ 
  isOpen,
  onClose,
  request,
  onApprove,
  onReject
}: VerificationRequestDialogProps) {
  if (!request) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verification Request Details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={request.user.avatar_url || undefined} />
                  <AvatarFallback>
                    {request.user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{request.user.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{request.user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
              <CardDescription>
                Current Status: {getStatusBadge(request.verification_status)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Document Type:</span>
                  <Badge variant="outline" className="ml-2">
                    {request.document_type.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Document Number:</span>
                  <span className="ml-2">{request.document_number}</span>
                </div>
                <div>
                  <span className="font-medium">Expiry Date:</span>
                  <span className="ml-2">
                    {format(new Date(request.document_expiry), 'PPP')}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Submission Date:</span>
                  <span className="ml-2">
                    {format(new Date(request.created_at), 'PPP')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Images */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.document_urls.map((url, index) => (
                  <div key={index} className="group relative aspect-[3/2] overflow-hidden rounded-lg border bg-muted ">
                    <Image
                      src={url}
                      alt={`Document ${index + 1}`}
                      fill
                      className="object-contain transition-transform group-hover:scale-105 group-checked:scale-405"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          {request.admin_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{request.admin_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {request.verification_status === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={() => onReject?.(request)}
              >
                Reject
              </Button>
              <Button
                onClick={() => onApprove?.(request)}
              >
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}