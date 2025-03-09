// hooks/use-verifications.ts
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  getVerificationRequests, 
  approveVerification, 
  rejectVerification,
  getVerificationStats 
} from '@/actions/admin-verification-actions';
import type { 
  AdminVerificationRequest, 
  VerificationStats,
  VerificationFilters 
} from '@/types/verification-admin';

interface UseVerificationsOptions {
  initialPage?: number;
  limit?: number;
}

interface FilterState extends VerificationFilters {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  documentType: 'all' | 'id' | 'passport';
}

interface SearchState {
    query: string;
    isSearching: boolean;
  }


export function useVerifications(options: UseVerificationsOptions = {}) {
  const { initialPage = 1, limit = 10 } = options;
  
  const [requests, setRequests] = useState<AdminVerificationRequest[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    status: 'pending',
    documentType: 'all'
  });
  const [search, setSearch] = useState<SearchState>({
    query: '',
    isSearching: false
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [requestsData, statsData] = await Promise.all([
        getVerificationRequests(page, limit, filters, search.query),
        getVerificationStats()
      ]);
      setRequests(requestsData.requests);
      setTotalPages(Math.ceil(requestsData.total / limit));
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, search.query]);

  const handleApprove = async (requestId: string, adminNotes?: string) => {
    try {
      await approveVerification(requestId, adminNotes);
      await loadData();
      toast({
        title: 'Success',
        description: 'Verification request approved successfully'
      });
      return true;
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve verification request',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleReject = async (requestId: string, rejectionReason: string, adminNotes?: string) => {
    try {
      await rejectVerification(requestId, rejectionReason, adminNotes);
      await loadData();
      toast({
        title: 'Success',
        description: 'Verification request rejected successfully'
      });
      return true;
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject verification request',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
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
  };
}

export type UseVerificationsReturn = ReturnType<typeof useVerifications>;