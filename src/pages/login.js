import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Cookies from 'universal-cookie';
import '../assets/css/login.css';
import logoSudeca from '../assets/img/logo_Sudeca.svg';
import loginImage from '../assets/img/login.png';
import config from '../config';

const baseUrl = config.API_BASE_URL;
const cookies = new Cookies();

const Login = () => {
    const css = `
        body {
            background-color: #f6f6f6 !important;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        
        .login-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            display: flex;
            flex-wrap: wrap;
        }
        
        .form-container {
            padding: 40px;
            flex: 1;
            min-width: 300px;
        }
        
        .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .logo-container img {
            max-width: 100%;
            height: auto;
        }
        
        .logo-main-container {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo-main-container img {
            max-width: 200px;
        }
        
        .spinner {
            display: inline-block;
            width: 1.5rem;
            height: 1.5rem;
            vertical-align: middle;
            border: 0.2em solid currentColor;
            border-right-color: transparent;
            border-radius: 50%;
            animation: spinner-rotate .75s linear infinite;
            margin-right: 10px;
        }
        
        @keyframes spinner-rotate {
            100% { transform: rotate(360deg); }
        }
        
        .btn-disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
            .logo-container {
                display: none;
            }
            
            .form-container {
                width: 100%;
            }
            
            body {
                padding: 10px;
            }
        }
    `;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Estado para controlar el spinner
    const [errorMessage, setErrorMessage] = useState(''); // Estado para mensajes de error

    useEffect(() => {
        if (cookies.get('usuario')) {
            window.location.href = "./home";
        }
    }, []);

    const loginSesion = async () => {
        setIsLoading(true); // Activar spinner y bloquear botón
        setErrorMessage(''); // Limpiar mensajes de error previos
        
        const data = JSON.stringify({ usuario: username, pass: password });
        const customConfig = {
            headers: {
                'Content-Type': 'application/json; charset=utf8',
                'Accept': 'application/json'
            }
        };

        try {
            const response = await axios.post(baseUrl + "/api/login", data, customConfig);
            
            if (response.data.status === "success") {
                const respuesta = response.data.data;
                cookies.set('idUsuario', respuesta.idUsuario, { path: "/" });
                cookies.set('email', respuesta.email, { path: "/" });
                cookies.set('apellido', respuesta.apellido, { path: "/" });
                cookies.set('nombre', respuesta.nombre, { path: "/" });
                cookies.set('id_caho', respuesta.id_caho, { path: "/" });
                cookies.set('nombreCaho', respuesta.nombreCaho, { path: "/" });
                cookies.set('idPlanContable', respuesta.idPlanContable, { path: "/" });
                cookies.set('codigoCaho', respuesta.codigoCaho, { path: "/" });
                cookies.set('sectorCaho', respuesta.sectorCaho, { path: "/" });
                cookies.set('usuario_caja', respuesta.usuarioCaja, { path: "/" });
                cookies.set('permisologia',respuesta.permisologia, { path: "/" });
                cookies.set('token', respuesta.token, { path: "/" });
                cookies.set('nombreRol', respuesta.nombreRol, { path: "/" });
                
                console.log("response.data.data: ",response.data.data);
                window.location.href = "./home";
            } else {
                setErrorMessage('El usuario o la contraseña no son correctos');
            }
        } catch (error) {
            console.error(error);
            if (error.response) {
                // El servidor respondió con un estado de error
                if (error.response.status === 401) {
                    setErrorMessage('Credenciales inválidas');
                } else if (error.response.status >= 500) {
                    setErrorMessage('Error en el servidor. Por favor intente más tarde.');
                } else {
                    setErrorMessage('Error al iniciar sesión');
                }
            } else if (error.request) {
                // La solicitud fue hecha pero no se recibió respuesta
                setErrorMessage('No se pudo conectar al servidor. Verifique su conexión a internet.');
            } else {
                // Algo pasó al configurar la solicitud
                setErrorMessage('Error al iniciar sesión. Intente nuevamente.');
            }
        } finally {
            setIsLoading(false); // Desactivar spinner sin importar el resultado
        }
    };

    // Manejar la tecla Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            loginSesion();
        }
    };

    return (
        <>
            <style>{css}</style>
            <div className="login-container">
                <div className="form-container">
                    <div className="logo-main-container">
                        <img src={logoSudeca} alt="Logo de Sudeca" />
                    </div>

                    <h2>Bienvenidos a</h2>
                    <p>Sistema Administrativo, Contable y Financiero para las Cajas de Ahorro</p>

                    <form className="login-form">
                        {/* Campo de Email con icono */}
                        <div>
                            <label htmlFor="email" className="form-label">Correo de ingreso</label>
                            <div className="input-group">
                                <input
                                    type="email"
                                    className="form-control login-input"
                                    id="email"
                                    name="email"
                                    placeholder="email.sudeca@email.com"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading}
                                />
                                <span className="input-group-text">
                                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                                </span>
                            </div>
                        </div>

                        {/* Campo de Contraseña con icono */}
                        <div>
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <div className="input-group">
                                <input
                                    type="password"
                                    className="form-control login-input"
                                    id="password"
                                    name="password"
                                    placeholder="Ingresa tu contraseña"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading}
                                />
                                <span className="input-group-text">
                                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                                </span>
                            </div>
                        </div>

                        {/* Mensaje de error */}
                        {errorMessage && (
                            <div className="alert alert-danger mt-3">
                                {errorMessage}
                            </div>
                        )}

                        {/* Botón de Ingreso */}
                        <button 
                            type="button" 
                            id="btnLogin" 
                            className={`btn btn-primary login-button ${isLoading ? 'btn-disabled' : ''}`} 
                            onClick={loginSesion}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span className="button-text">Ingresando...</span>
                                </>
                            ) : (
                                <span className="button-text">Ingresar al Sistema</span>
                            )}
                        </button>

                        {/* Enlace de recuperación */}
                        <div className="create-account-link">
                            <a href="/password_recovery">¿Olvidó su contraseña? <b>Recuperar</b></a>
                        </div>
                    </form>
                </div>

                <div className="logo-container d-none d-md-flex">
                    <img src={loginImage} alt="Imagen de login" />
                </div>
            </div>
        </>
    );
};

export default Login;