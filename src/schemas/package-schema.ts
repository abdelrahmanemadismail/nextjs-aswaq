import { z } from 'zod';

export const packageSelectionSchema = z.object({
  packageId: z.string().uuid(),
});

export type PackageSelectionInput = z.infer<typeof packageSelectionSchema>;