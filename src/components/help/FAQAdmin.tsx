import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import FAQPreview from './FAQPreview';
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { FAQCategory, FAQArticle } from '@/types/help';
import MDEditor from '@uiw/react-md-editor';

interface FAQAdminProps {
  categories: FAQCategory[];
  articles: FAQArticle[];
  onCreateCategory: (category: Partial<FAQCategory>) => Promise<void>;
  onUpdateCategory: (id: string, category: Partial<FAQCategory>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onCreateArticle: (article: Partial<FAQArticle>) => Promise<void>;
  onUpdateArticle: (id: string, article: Partial<FAQArticle>) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
}

export default function FAQAdmin({
  categories,
  articles,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateArticle,
  onUpdateArticle,
  onDeleteArticle,
}: FAQAdminProps) {
  const [activeTab, setActiveTab] = useState('categories');
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [editingArticle, setEditingArticle] = useState<FAQArticle | null>(null);
  const [previewData, setPreviewData] = useState<{ title: string; content: string; } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'category' | 'article' } | null>(null);

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  const [articleFormData, setArticleFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category_id: '',
    tags: [] as string[],
    is_published: false,
    display_order: 0,
  });

  // Reset form data when dialog closes
  const resetForms = () => {
    setEditingCategory(null);
    setEditingArticle(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      display_order: 0,
      is_active: true,
    });
    setArticleFormData({
      title: '',
      slug: '',
      content: '',
      category_id: '',
      tags: [],
      is_published: false,
      display_order: 0,
    });
  };

  const validateCategoryForm = () => {
    const errors: Record<string, string> = {};
    
    if (!categoryFormData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!categoryFormData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(categoryFormData.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    return errors;
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateCategoryForm();

    if (Object.keys(errors).length > 0) {
      // Show validation errors
      Object.entries(errors).forEach(([field, message]) => {
        toast({
          title: `Invalid ${field}`,
          description: message,
          variant: 'destructive',
        });
      });
      return;
    }

    setIsLoading(true);

    try {
      const formattedData = {
        ...categoryFormData,
        slug: categoryFormData.slug.toLowerCase(),
        display_order: Number(categoryFormData.display_order)
      };

      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, formattedData);
        toast({
          title: 'Category updated',
          description: 'The category has been updated successfully.',
        });
      } else {
        await onCreateCategory(formattedData);
        toast({
          title: 'Category created',
          description: 'The category has been created successfully.',
        });
      }
      resetForms();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save category. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateArticleForm = () => {
    const errors: Record<string, string> = {};
    
    if (!articleFormData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!articleFormData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(articleFormData.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!articleFormData.category_id) {
      errors.category = 'Category is required';
    }

    if (!articleFormData.content.trim()) {
      errors.content = 'Content is required';
    }

    return errors;
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateArticleForm();

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        toast({
          title: `Invalid ${field}`,
          description: message,
          variant: 'destructive',
        });
      });
      return;
    }

    setIsLoading(true);

    try {
      const formattedData = {
        ...articleFormData,
        slug: articleFormData.slug.toLowerCase(),
        display_order: Number(articleFormData.display_order),
        tags: articleFormData.tags.filter(tag => tag.trim() !== '')
      };

      if (editingArticle) {
        await onUpdateArticle(editingArticle.id, formattedData);
        toast({
          title: 'Article updated',
          description: 'The article has been updated successfully.',
        });
      } else {
        await onCreateArticle(formattedData);
        toast({
          title: 'Article created',
          description: 'The article has been created successfully.',
        });
      }
      resetForms();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save article. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsLoading(true);
    try {
      if (itemToDelete.type === 'category') {
        await onDeleteCategory(itemToDelete.id);
      } else {
        await onDeleteArticle(itemToDelete.id);
      }
      toast({
        title: 'Item deleted',
        description: `The ${itemToDelete.type} has been deleted successfully.`,
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete ${itemToDelete.type}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Help Center Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCategorySubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Edit Category' : 'Create Category'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={categoryFormData.name}
                        onChange={(e) =>
                          setCategoryFormData((prev) => ({
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
                        value={categoryFormData.slug}
                        onChange={(e) =>
                          setCategoryFormData((prev) => ({
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
                        value={categoryFormData.description}
                        onChange={(e) =>
                          setCategoryFormData((prev) => ({
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
                        value={categoryFormData.display_order}
                        onChange={(e) =>
                          setCategoryFormData((prev) => ({
                            ...prev,
                            display_order: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={categoryFormData.is_active}
                        onCheckedChange={(checked) =>
                          setCategoryFormData((prev) => ({
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
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>FAQ Categories</CardTitle>
              <CardDescription>
                Manage help center categories and their organization
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                            onClick={() => {
                              setEditingCategory(category);
                              setCategoryFormData({
                                name: category.name,
                                slug: category.slug,
                                description: category.description || '',
                                display_order: category.display_order,
                                is_active: category.is_active,
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setItemToDelete({
                                    id: category.id,
                                    type: 'category',
                                  });
                                }}
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
                                  onClick={handleDelete}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <form onSubmit={handleArticleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingArticle ? 'Edit Article' : 'Create Article'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="slug"
                          value={articleFormData.slug}
                          onChange={(e) =>
                            setArticleFormData((prev) => ({
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
                        value={articleFormData.category_id}
                        onChange={(e) =>
                          setArticleFormData((prev) => ({
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
                          value={articleFormData.content}
                          onChange={(value) =>
                            setArticleFormData((prev) => ({
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
                        value={articleFormData.tags.join(', ')}
                        onChange={(e) =>
                          setArticleFormData((prev) => ({
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
                        value={articleFormData.display_order}
                        onChange={(e) =>
                          setArticleFormData((prev) => ({
                            ...prev,
                            display_order: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_published"
                        checked={articleFormData.is_published}
                        onCheckedChange={(checked) =>
                          setArticleFormData((prev) => ({
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
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>FAQ Articles</CardTitle>
              <CardDescription>
                Manage help center articles and their content
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                            onClick={() => {
                              setEditingArticle(article);
                              setArticleFormData({
                                title: article.title,
                                slug: article.slug,
                                content: article.content,
                                category_id: article.category_id,
                                tags: article.tags,
                                is_published: article.is_published,
                                display_order: article.display_order,
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setPreviewData({
                                title: article.title,
                                content: article.content
                              });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setItemToDelete({
                                    id: article.id,
                                    type: 'article',
                                  });
                                }}
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
                                  onClick={handleDelete}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewData && (
        <FAQPreview
          isOpen={!!previewData}
          onClose={() => setPreviewData(null)}
          title={previewData.title}
          content={previewData.content}
        />
      )}
    </div>
  );
}