export interface AuthRole {
  id: number;
  name: string;
  scope: string;
}

export interface AuthUser {
  id: number;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image: string | null;
  status: string;
  role?: AuthRole;
}

export interface WebTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CompanyRoleMembership {
  id: number;
  name: string;
  scope: string;
  permissions?: CompanyPermission[];
}

export interface CompanyPermission {
  id: number;
  code: string;
  name: string;
  module: string;
  create_permission?: boolean;
  update_permission?: boolean;
  delete_permission?: boolean;
  view_permission?: boolean;
  execute_permission?: boolean;
}

export interface UserCompanyMembership {
  company_user_id: number;
  primary_role: string;
  company: {
    id: number;
    name: string;
    type: 'food' | 'products' | 'services';
    logo: string | null;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    status: string;
  };
  roles: CompanyRoleMembership[];
}

export interface WebSession {
  user: AuthUser;
  tokens: WebTokens;
  companies: UserCompanyMembership[];
  activeCompanyId: number | null;
}

export interface LoginResponseData {
  user: AuthUser;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}

export interface UserCompaniesResponseData {
  companies: UserCompanyMembership[];
}
