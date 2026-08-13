export function getPasswordInputType(isVisible: boolean): 'text' | 'password' {
  return isVisible ? 'text' : 'password';
}
