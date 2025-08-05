import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faKey } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../assets/css/login.css';
import logoSudeca from '../assets/img/logo_Sudeca.svg';
import loginImage from '../assets/img/login.png';
import config from '../config';
const baseUrl = config.API_BASE_URL;

const PasswordRecovery = () => {
    const css = `
        body {
            background-color: #f6f6f6 !important;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
    `;

    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: solicitar usuario, 2: ingresar código y nueva contraseña
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRecoveryRequest = async () => {
        setLoading(true);
        setError('');
        
        const customConfig = {
          headers: {
            'Content-Type': 'application/json; charset=utf8',
            'Accept': 'application/json'
          },
          withCredentials: false
        };
        const data = JSON.stringify({ username: username });
        try {
            /*const response = await axios.post(`${baseUrl}/api/password-recovery`, { 
              username: username 
            });*/

            const response = await axios.post(baseUrl + "/api/password-recovery", data, customConfig);
            console.log("response: ",response.data.status)
            if (response.data.status === "success") {
                setInfo('Correo de recuperación enviado exitosamente');
                setStep(2);
            } else {
                setError('El usuario no es válido');
            }
        } catch (err) {
            setError('Error al procesar la solicitud. Intente nuevamente.');
            console.error(err);
        } finally {
            setLoading(false);
            setTimeout(() => {
              setError('');
            }, 5000);
        }
    };

    const handlePasswordReset = async () => {
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        
        setLoading(true);
        setError('');
        const customConfig = {
          headers: {
            'Content-Type': 'application/json; charset=utf8',
            'Accept': 'application/json'
          },
          withCredentials: false
        };
        const data = JSON.stringify({ email_code: code,password: newPassword });
        try {
            const response = await axios.post(`${baseUrl}/api/reset-password`, data,customConfig);
            console.log(response)
            console.log("estatus",response.data.status)
            if (response.data.status === "success") {
                setInfo('Contraseña actualizada correctamente');
                window.location.href = "/login"; // Redirigir al login
            } else {
                setError(response.data.message || 'Error al actualizar la contraseña');
            }
        } catch (err) {
            setError('Error al procesar la solicitud. Intente nuevamente.');
            console.error(err);
        } finally {
            setLoading(false);
            setTimeout(() => {
              setError('');
            }, 5000);
        }
    };

    return (
        <>
            <style>{css}</style>
            <div className="login-container col-xs-12">
                <div className="form-container col-xs-12 col-sm-6 col-md-6">
                    <div className="logo-main-container">
                        <img src={logoSudeca} alt="Logo de Sudeca" />
                    </div>
                
                    <h2>Recuperación de Contraseña</h2>
                    <p>Ingresa tu usuario para recuperar tu contraseña</p>
                    
                    <form className="login-form">
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        {info && (
                            <div className="alert alert-info" role="alert">
                                {info}
                            </div>
                        )}

                        {step === 1 ? (
                            <>
                                {/* Campo de Usuario */}
                                <div>
                                    <label htmlFor="username" className="form-label">Usuario</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control login-input"
                                            id="username"
                                            name="username"
                                            placeholder="Ingresa tu usuario"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                        <span className="input-group-text">
                                            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                                        </span>
                                    </div>
                                </div>

                                {/* Botón de Recuperar */}
                                <button 
                                    type="button" 
                                    className="btn btn-primary login-button" 
                                    onClick={handleRecoveryRequest}
                                    disabled={loading}
                                >
                                    <span className="button-text">
                                        {loading ? 'Procesando...' : 'Recuperar'}
                                    </span>
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Campo de Código */}
                                <div>
                                    <label htmlFor="code" className="form-label">Código de verificación</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control login-input"
                                            id="code"
                                            name="code"
                                            placeholder="Ingresa el código enviado a tu correo"
                                            required
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                        />
                                        <span className="input-group-text">
                                            <FontAwesomeIcon icon={faKey} className="input-icon" />
                                        </span>
                                    </div>
                                </div>

                                {/* Campo de Nueva Contraseña */}
                                <div>
                                    <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
                                    <div className="input-group">
                                        <input
                                            type="password"
                                            className="form-control login-input"
                                            id="newPassword"
                                            name="newPassword"
                                            placeholder="Ingresa tu nueva contraseña"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <span className="input-group-text">
                                            <FontAwesomeIcon icon={faLock} className="input-icon" />
                                        </span>
                                    </div>
                                </div>

                                {/* Campo de Confirmar Contraseña */}
                                <div>
                                    <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                                    <div className="input-group">
                                        <input
                                            type="password"
                                            className="form-control login-input"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            placeholder="Confirma tu nueva contraseña"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <span className="input-group-text">
                                            <FontAwesomeIcon icon={faLock} className="input-icon" />
                                        </span>
                                    </div>
                                </div>

                                {/* Botón de Guardar Contraseña */}
                                <button 
                                    type="button" 
                                    className="btn btn-primary login-button" 
                                    onClick={handlePasswordReset}
                                    disabled={loading}
                                >
                                    <span className="button-text">
                                        {loading ? 'Procesando...' : 'Guardar Contraseña'}
                                    </span>
                                </button>
                            </>
                        )}
                        
                        {/* Enlace para volver al login */}
                        <div className="create-account-link">
                            <a href="/login">Volver al inicio de sesión</a>
                        </div>
                    </form>
                </div>
                
                <div className="logo-container col-xs-12 col-sm-6 col-md-6">
                    <img src={loginImage} />
                </div>
            </div>
        </>
    );
};

export default PasswordRecovery;