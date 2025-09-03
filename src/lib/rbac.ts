// Role-Based Access Control (RBAC) System for Nexa Platform

export type UserRole = 'student' | 'mentor' | 'admin' | 'recruiter' | 'moderator';

export type Permission = 
  // User Management
  | 'users:read' | 'users:write' | 'users:delete'
  // Profile Management
  | 'profile:read' | 'profile:write' | 'profile:delete'
  // Roadmaps
  | 'roadmaps:read' | 'roadmaps:write' | 'roadmaps:delete' | 'roadmaps:share'
  // Projects
  | 'projects:read' | 'projects:write' | 'projects:delete' | 'projects:review'
  // Mentorship
  | 'mentorship:read' | 'mentorship:write' | 'mentorship:delete' | 'mentorship:schedule'
  // Opportunities
  | 'opportunities:read' | 'opportunities:write' | 'opportunities:delete' | 'opportunities:apply'
  // Content
  | 'content:read' | 'content:write' | 'content:delete' | 'content:moderate'
  // Analytics
  | 'analytics:read' | 'analytics:write'
  // System
  | 'system:admin' | 'system:moderate' | 'system:config';

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

// Define role permissions
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  student: {
    role: 'student',
    description: 'Regular student user with basic platform access',
    permissions: [
      'profile:read', 'profile:write',
      'roadmaps:read', 'roadmaps:write', 'roadmaps:share',
      'projects:read', 'projects:write',
      'mentorship:read', 'mentorship:write', 'mentorship:schedule',
      'opportunities:read', 'opportunities:apply',
      'content:read', 'content:write'
    ]
  },
  
  mentor: {
    role: 'mentor',
    description: 'Mentor with additional teaching and guidance capabilities',
    permissions: [
      'profile:read', 'profile:write',
      'roadmaps:read', 'roadmaps:write', 'roadmaps:share',
      'projects:read', 'projects:write', 'projects:review',
      'mentorship:read', 'mentorship:write', 'mentorship:delete', 'mentorship:schedule',
      'opportunities:read',
      'content:read', 'content:write',
      'analytics:read'
    ]
  },
  
  recruiter: {
    role: 'recruiter',
    description: 'Recruiter with access to talent pool and job posting capabilities',
    permissions: [
      'profile:read',
      'roadmaps:read',
      'projects:read',
      'opportunities:read', 'opportunities:write', 'opportunities:delete',
      'content:read',
      'analytics:read'
    ]
  },
  
  moderator: {
    role: 'moderator',
    description: 'Content moderator with community management capabilities',
    permissions: [
      'users:read',
      'profile:read',
      'roadmaps:read', 'roadmaps:delete',
      'projects:read', 'projects:delete',
      'mentorship:read', 'mentorship:delete',
      'opportunities:read', 'opportunities:delete',
      'content:read', 'content:write', 'content:delete', 'content:moderate',
      'analytics:read',
      'system:moderate'
    ]
  },
  
  admin: {
    role: 'admin',
    description: 'System administrator with full platform access',
    permissions: [
      'users:read', 'users:write', 'users:delete',
      'profile:read', 'profile:write', 'profile:delete',
      'roadmaps:read', 'roadmaps:write', 'roadmaps:delete', 'roadmaps:share',
      'projects:read', 'projects:write', 'projects:delete', 'projects:review',
      'mentorship:read', 'mentorship:write', 'mentorship:delete', 'mentorship:schedule',
      'opportunities:read', 'opportunities:write', 'opportunities:delete', 'opportunities:apply',
      'content:read', 'content:write', 'content:delete', 'content:moderate',
      'analytics:read', 'analytics:write',
      'system:admin', 'system:moderate', 'system:config'
    ]
  }
};

// RBAC Service Class
export class RBACService {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions.permissions.includes(permission);
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(userRole: UserRole): Permission[] {
    return ROLE_PERMISSIONS[userRole].permissions;
  }

  /**
   * Get role information
   */
  static getRoleInfo(userRole: UserRole): RolePermissions {
    return ROLE_PERMISSIONS[userRole];
  }

  /**
   * Check if a role can access a specific resource
   */
  static canAccessResource(userRole: UserRole, resource: string, action: string): boolean {
    const permission = `${resource}:${action}` as Permission;
    return this.hasPermission(userRole, permission);
  }

  /**
   * Get available roles for a user (for role assignment)
   */
  static getAvailableRoles(): UserRole[] {
    return Object.keys(ROLE_PERMISSIONS) as UserRole[];
  }

  /**
   * Validate role hierarchy (admin > moderator > mentor > recruiter > student)
   */
  static getRoleHierarchy(): Record<UserRole, number> {
    return {
      admin: 5,
      moderator: 4,
      mentor: 3,
      recruiter: 2,
      student: 1
    };
  }

  /**
   * Check if one role is higher than another
   */
  static isRoleHigher(role1: UserRole, role2: UserRole): boolean {
    const hierarchy = this.getRoleHierarchy();
    return hierarchy[role1] > hierarchy[role2];
  }

  /**
   * Get roles that a user can manage (lower in hierarchy)
   */
  static getManageableRoles(userRole: UserRole): UserRole[] {
    const hierarchy = this.getRoleHierarchy();
    const userLevel = hierarchy[userRole];
    
    return Object.entries(hierarchy)
      .filter(([_, level]) => level < userLevel)
      .map(([role, _]) => role as UserRole);
  }
}

// React Hook for RBAC
export function useRBAC(userRole: UserRole) {
  return {
    hasPermission: (permission: Permission) => RBACService.hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) => RBACService.hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) => RBACService.hasAllPermissions(userRole, permissions),
    canAccessResource: (resource: string, action: string) => RBACService.canAccessResource(userRole, resource, action),
    getPermissions: () => RBACService.getRolePermissions(userRole),
    getRoleInfo: () => RBACService.getRoleInfo(userRole),
    isRoleHigher: (otherRole: UserRole) => RBACService.isRoleHigher(userRole, otherRole),
    getManageableRoles: () => RBACService.getManageableRoles(userRole)
  };
}

// Higher-Order Component for permission-based rendering
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission,
  fallback?: React.ComponentType<P>
) {
  return function PermissionWrappedComponent(props: P & { userRole: UserRole }) {
    const { userRole, ...restProps } = props;
    
    if (RBACService.hasPermission(userRole, permission)) {
      return <Component {...(restProps as P)} />;
    }
    
    if (fallback) {
      return <fallback {...(restProps as P)} />;
    }
    
    return null;
  };
}

// Permission Guard Component
interface PermissionGuardProps {
  userRole: UserRole;
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({ userRole, permission, fallback, children }: PermissionGuardProps) {
  if (RBACService.hasPermission(userRole, permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback || null}</>;
}

// Resource Access Guard
interface ResourceGuardProps {
  userRole: UserRole;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ResourceGuard({ userRole, resource, action, fallback, children }: ResourceGuardProps) {
  if (RBACService.canAccessResource(userRole, resource, action)) {
    return <>{children}</>;
  }
  
  return <>{fallback || null}</>;
}
