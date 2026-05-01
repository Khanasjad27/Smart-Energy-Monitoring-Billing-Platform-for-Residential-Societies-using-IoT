const TOKEN_KEY = 'smart-energy-token';

export const getToken = () => window.localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => window.localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => window.localStorage.removeItem(TOKEN_KEY);
export const isAuthenticated = () => Boolean(getToken());
