export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategoryRequest {
  name: string;
  description: string;
  active: boolean;
}
