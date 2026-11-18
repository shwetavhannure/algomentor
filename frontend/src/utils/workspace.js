export function lastWorkspaceStorageKey(user) {
  return `algomentor_last_workspace:${user?.email || 'anonymous'}`;
}
