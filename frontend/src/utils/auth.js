import { jwtDecode } from 'jwt-decode';

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

// We don't need setUser anymore since we extract from token
export const setUser = (user) => {
    // Left for compatibility if needed elsewhere
};

export const getUser = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
        const decoded = jwtDecode(token);
        // The token payload contains id, email, role. We can return this.
        return decoded;
    } catch (error) {
        return null;
    }
};

export const removeUser = () => {
    // left for compatibility
};

export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;
    try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
            removeToken();
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
};

export const logout = () => {
    removeToken();
    window.location.href = '/login';
};
