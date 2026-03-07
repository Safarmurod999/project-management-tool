export enum PermissionCode {
  // USER
  USER_CREATE = 'user:create',
  USER_GET = 'user:get',
  USER_EDIT = 'user:edit',
  USER_DELETE = 'user:delete',

  // ROLE
  ROLE_CREATE = 'role:create',
  ROLE_GET = 'role:get',
  ROLE_EDIT = 'role:edit',
  ROLE_DELETE = 'role:delete',

  // PERMISSION
  PERMISSION_CREATE = 'permission:create',
  PERMISSION_GET = 'permission:get',
  PERMISSION_EDIT = 'permission:edit',
  PERMISSION_DELETE = 'permission:delete',

  // BOARD
  BOARD_CREATE = 'board:create',
  BOARD_GET = 'board:get',
  BOARD_EDIT = 'board:edit',
  BOARD_DELETE = 'board:delete',

  // TEAM
  TEAM_CREATE = 'team:create',
  TEAM_GET = 'team:get',
  TEAM_EDIT = 'team:edit',
  TEAM_DELETE = 'team:delete',

  // PROJECT
  PROJECT_CREATE = 'project:create',
  PROJECT_GET = 'project:get',
  PROJECT_EDIT = 'project:edit',
  PROJECT_DELETE = 'project:delete',

  // DOCS
  DOCS_CREATE = 'docs:create',
}

export enum RoleCode {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  TEST = 'test',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

export enum RoleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export enum PermissionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export enum BoardVisibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public',
}

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum TeamStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum ScopeType {
  TEAM = 'team',
  PROJECT = 'project',
  BOARD = 'board',
}
