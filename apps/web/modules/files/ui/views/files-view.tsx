"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { usePaginatedQuery, useAction, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { FileIcon, MoreHorizontalIcon, PlusIcon, TrashIcon } from "lucide-react";
import type { PublicFile } from "@workspace/backend/private/files";
import { useRef, useState } from "react";
import { UploadDialog } from "../components/upload-dialog";
import { DeleteFileDialog } from "../components/delete-file-dialog";

export const FilesView = () => {
  const files = usePaginatedQuery(
    api.private.files.list,
    {},
    {
      initialNumItems: 10,
    }
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingFirstPage,
    isLoadingMore,
  } = useInfiniteScroll({
    status: files.status,
    loadMore: files.loadMore,
    loadSize: 10,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const addFile = useAction(api.private.files.addFile);
  const deleteFile = useMutation(api.private.files.deletefile);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const bytes = await file.arrayBuffer();
      await addFile({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        bytes,
      });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      // Reset input so same file can be uploaded again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (file: PublicFile) => {
    try {
      await deleteFile({ entryId: file.id });
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const [uploadDialogOPen, setuploadDialogOpen ] = useState(false);
  const [deleteDialogOPen, setdeleteDialogOpen ] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null);
  const handleDeleteClick = (file: PublicFile) => {
    setSelectedFile(file);
    setdeleteDialogOpen(true);
  };
  const handleFileDeleted = () => {
    setSelectedFile(null);
  }


  return (
    <>
     <DeleteFileDialog
     onOpenChange={setdeleteDialogOpen}
     open={deleteDialogOPen}
     file={selectedFile}
     onDeleted={handleFileDeleted}

     />
     <UploadDialog
      onOpenChange={setuploadDialogOpen}
      open={uploadDialogOPen}

    />
     <div className="flex min-h-screen flex-col bg-muted p-8">
      <div className="mx-auto w-full max-w-screen-md">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Upload and manage documents for your AI assistant
          </p>
        </div>

        <div className="mt-8 rounded-lg border bg-background">
          <div className="flex items-center justify-end border-b px-6 py-4">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md,.docx,.csv"
              onChange={handleFileUpload}
            />
            <Button
              onClick={() => setuploadDialogOpen(true)}
              disabled={isUploading}
            >
              <PlusIcon className="size-4 mr-2" />
              {isUploading ? "Uploading..." : "Add New"}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (isLoadingFirstPage) {
                  return (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Loading files...
                      </TableCell>
                    </TableRow>
                  );
                }

                if (files.results.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No files found
                      </TableCell>
                    </TableRow>
                  );
                }

                return files.results.map((file) => (
                  <TableRow key={file.id} className="hover:bg-muted/50">
                    <TableCell className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <FileIcon />
                        {file.name}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium">
                      <Badge className="uppercase" variant="outline">
                        {file.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {file.size}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="size-8 p-0" size="sm" variant="ghost">
                            <MoreHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(file)}
                          >
                            <TrashIcon className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>

          {!isLoadingFirstPage && files.results.length > 0 && (
            <div className="border-t">
              <InfiniteScrollTrigger
                canLoadMore={canLoadMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
                ref={topElementRef}
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};