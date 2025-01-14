import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import PageComponents from '@/components/mdx/PageComponents';

interface FAQPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function FAQPreview({
  isOpen,
  onClose,
  title,
  content,
}: FAQPreviewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview: {title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full">
          <Card>
            <CardContent className="prose prose-sm max-w-none p-6">
              <MDXRemote
                source={content}
                components={PageComponents}
              />
            </CardContent>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}