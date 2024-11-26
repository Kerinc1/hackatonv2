import axios from 'axios';

const API_URL2 = "http://localhost:5005/login";
const API_URL = "http://localhost:5005/items";

// Obtener productos
export const getItems = async (userId) => {
    const token = localStorage.getItem('jwt');
    const response = await axios.get(`${API_URL}/items/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Agregar producto
export const addItem = async (formData, token) => {
    await axios.post(`${API_URL}/items`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
};

// Actualizar producto
export const updateItem = async (id, formData, token) => {
    await axios.put(`${API_URL}/items/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
};

// Eliminar producto
export const deleteItem = async (id, token) => {
    await axios.delete(`${API_URL}/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};


// Función de inicio de sesión
export const loginUser = async (form) => {
    try {
        const response = await fetch(`${API_URL2}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });

        if (!response.ok) {
            throw new Error('Error en el inicio de sesión.');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la solicitud de inicio de sesión:', error);
        throw error;
    };
};