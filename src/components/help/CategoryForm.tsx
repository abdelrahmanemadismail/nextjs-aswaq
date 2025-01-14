import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { Badge, Eye, Loader2, Pencil, Table, Trash2 } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogCancel, AlertDialogAction, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogContent } from '@/components/ui/alert-dialog';

interface CategoryFormProps {
  formData: {
    name: string;
    slug: string;
    description: string;
    display_order: number;
    is_active: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    slug: string;
    description: string;
    display_order: number;
    is_active: boolean;
  }>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  isEditing: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  isEditing
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                slug: e.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                display_order: parseInt(e.target.value),
              }))
            }
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                is_active: checked,
              }))
            }
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// ArticleForm.tsx
export const ArticleForm: React.FC<{
  formData: {
    title: string;
    slug: string;
    content: string;
    category_id: string;
    tags: string[];
    is_published: boolean;
    display_order: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    slug: string;
    content: string;
    category_id: string;
    tags: string[];
    is_published: boolean;
    display_order: number;
  }>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  isEditing: boolean;
  categories: Array<{ id: string; name: string }>;
}> = ({ formData, setFormData, onSubmit, isLoading, categories, isEditing }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  slug: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={formData.category_id}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                category_id: e.target.value,
              }))
            }
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content (MDX)</Label>
          <div data-color-mode="light">
            <MDEditor
              value={formData.content}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  content: value || '',
                }))
              }
              height={400}
              preview="edit"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags.join(', ')}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                tags: e.target.value.split(',').map((tag) => tag.trim()),
              }))
            }
            placeholder="e.g. account, security, login"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                display_order: parseInt(e.target.value),
              }))
            }
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_published"
            checked={formData.is_published}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                is_published: checked,
              }))
            }
          />
          <Label htmlFor="is_published">Published</Label>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// CategoryTable.tsx
export const CategoryTable: React.FC<{
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    display_order: number;
  }>;
  onEdit: (category: any) => void;
  onDelete: (id: string) => void;
}> = ({ categories, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium">
              {category.name}
            </TableCell>
            <TableCell>{category.slug}</TableCell>
            <TableCell>
              <Badge
                variant={category.is_active ? 'default' : 'secondary'}
              >
                {category.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>{category.display_order}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete Category
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this category?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(category.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// ArticleTable.tsx
export const ArticleTable: React.FC<{
  articles: Array<{
    id: string;
    title: string;
    category_id: string;
    is_published: boolean;
    display_order: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
  }>;
  onEdit: (article: any) => void;
  onDelete: (id: string) => void;
  onPreview: (article: any) => void;
}> = ({ articles, categories, onEdit, onDelete, onPreview }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.id}>
            <TableCell className="font-medium">
              {article.title}
            </TableCell>
            <TableCell>
              {categories.find((c) => c.id === article.category_id)?.name}
            </TableCell>
            <TableCell>
              <Badge
                variant={article.is_published ? 'default' : 'secondary'}
              >
                {article.is_published ? 'Published' : 'Draft'}
              </Badge>
            </TableCell>
            <TableCell>{article.display_order}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(article)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPreview(article)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete Article
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this article?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(article.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};