export const isExecutableExtension = (extension: string) => {
  const ext = extension.toLowerCase();
  return ['exe', 'bat', 'cmd', 'com', 'scr', 'ps1', 'msi', 'jar', 'sh', 'vbs', 'js', 'cjs', 'mjs'].includes(ext);
};
