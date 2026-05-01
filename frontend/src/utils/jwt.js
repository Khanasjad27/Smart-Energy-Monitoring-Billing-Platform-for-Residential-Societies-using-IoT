export const decodeJwt = (token) => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const getUserIdFromToken = (token) => {
  const decoded = decodeJwt(token);
  return decoded?.id || null;
};

export const getUserRoleFromToken = (token) => {
  const decoded = decodeJwt(token);
  return decoded?.role || null;
};
