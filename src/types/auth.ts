export type AuthRole = {
  id: number;
  name: string;
  scope: string;
};

export type AuthUser = {
  id: number;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image: string | null;
  status: string;
  role?: AuthRole;
};

export type WebTokens = {
  accessToken: string;
  refreshToken: string;
};

export type UserCompanyMembership = {
  company_user_id: number;
  primary_role: string;
  company: {
    id: number;
    name: string;
    type: "food" | "products" | "services";
    logo: string | null;
    status: string;
  };
  roles: Array<{
    id: number;
    name: string;
    scope: string;
    permissions?: Array<{
      id: number;
      code: string;
      name: string;
      module: string;
      create_permission?: boolean;
      update_permission?: boolean;
      delete_permission?: boolean;
      view_permission?: boolean;
      execute_permission?: boolean;
    }>;
  }>;
};

export type WebSession = {
  user: AuthUser;
  tokens: WebTokens;
  companies: UserCompanyMembership[];
  activeCompanyId: number | null;
};

export type LoginResponseData = {
  user: AuthUser;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
};
