// import axios from 'axios';
// import { User } from '../types';
// import { setToken, removeToken } from '../utils/storage';

// const BASE_URL = '/api/users';

// export const register = async (name: string, email: string, password: string): Promise<User> => {
//     const response = await axios.post(`${BASE_URL}/register`, {
//         name,
//         email,
//         password
//     });

//     const user = response.data;
//     if (user.token) {
//         setToken(user.token);
//     }

//     return user;
// };

// export const login = async (email: string, password: string): Promise<User> => {
//     const response = await axios.post(`${BASE_URL}/login`, {
//         email,
//         password
//     });

//     const user = response.data;
//     if (user.token) {
//         setToken(user.token);
//     }

//     return user;
// };

// export const logout = (): void => {
//     removeToken();
// };

// export const getProfile = async (): Promise<User> => {
//     const response = await axios.get(`${BASE_URL}/profile`);
//     return response.data;
// };

// export const updateProfile = async (userData: Partial<User>): Promise<User> => {
//     const response = await axios.put(`${BASE_URL}/profile`, userData);

//     const user = response.data;
//     if (user.token) {
//         setToken(user.token);
//     }

//     return user;
// };