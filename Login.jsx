import React, { useState } from 'react';
import { loginUser } from './services/itemServices';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(form);

            if (response && response.success) {
                // Guarda el token y la información del usuario en el localStorage
                localStorage.setItem('token', response.token); // Guarda el token JWT
                localStorage.setItem('user', JSON.stringify(response.user)); // Guarda la información del usuario

                onLogin(response.user);

                alert('Inicio de sesión exitoso.');

                // Obtén el userId del usuario desde localStorage y navega a la ruta correcta
                const userId = JSON.parse(localStorage.getItem('user'))._id;
                navigate(`/?userId=${userId}`);
            } else {
                alert('No se recibió una respuesta exitosa. Por favor, inténtelo de nuevo.');
            }
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            alert('Error en el inicio de sesión. Por favor, inténtelo de nuevo.');
        }
    };

    return (
        <div>
            <header className="header-container">
                <nav id="nav-container">
                    <a href="/">
                        <img src="https://www.publicdomainpictures.net/pictures/130000/velka/yellow-background-1440627692qIZ.jpg" alt="Cibertech" className="image-logo" />
                    </a>

                    <a href="/register" className="a-sign-up" id="container-in-header">
                        <button className="button-sign-up">
                            <p>Registrarse</p>
                        </button>
                    </a>
                </nav>
            </header>

            <div className="div-container-login-register">
                <img src="https://www.publicdomainpictures.net/pictures/130000/velka/yellow-background-1440627692qIZ.jpg" className="background-login-register" />

                <form onSubmit={handleSubmit} className="form-login-register" id="form-login">
                    <h1 className="title-form">INICIAR SESION</h1>

                    <input
                        name="email"
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="form-button">Iniciar sesión</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
