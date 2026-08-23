export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface NavItem {
  name: string;
  path: string;
  icon: string;
  badge?: string;
}
