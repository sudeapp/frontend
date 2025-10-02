import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { FaUser, FaSave, FaUndo, FaEye, FaEyeSlash, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaBirthdayCake } from 'react-icons/fa';
import '../assets/css/perfilUsuario.css';
import { show_alerta, show_alerta2 } from '../functions';
import config from '../config';

const PerfilUsuario = () => {
    const cookies = new Cookies();
    const baseUrl = config.API_BASE_URL;
  const token = cookies.get('token');
  const userId = cookies.get('idUsuario');

  const [user, setUser] = useState({
    usuario: '',
    nombre: '',
    apellido: '',
    cedula: '',
    direccion: '',
    telefono: '',
    celular: '',
    email: '',
    fechaNac: '',
    cajaAhorro: null,
    roles: []
  });

  const [originalUser, setOriginalUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Cargar datos del usuario
  /*useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/usuario/get-id/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(response.data)
        const userData = response.data;
        setUser(userData);
        setOriginalUser(userData);
      } catch (error) {
        setMessage({ text: 'Error al cargar los datos del usuario', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  },[]);*/

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/usuario/get-id/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log(response.data)
            const userData = response.data;
            setUser(userData);
            setOriginalUser(userData);
          } catch (error) {
            setMessage({ text: 'Error al cargar los datos del usuario', type: 'error' });
          } finally {
            setLoading(false);
          }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await axios.put(`${baseUrl}/api/usuario/update-profile?id=${userId}`, user, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      //setMessage({ text: 'Perfil actualizado exitosamente', type: 'success' });
      setOriginalUser(user);
      show_alerta('Perfil actualizado exitosamente', 'success');
    } catch (error) {
      //setMessage({ text: 'Error al actualizar el perfil', type: 'error' });
      show_alerta('Error al actualizar el perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    
    setSaving(true);
    
    try {
      
        const response = await axios.post(`${baseUrl}/api/usuario/cambiar-password`, 
            {
                idUsuario:userId,
                viejo_password: passwords.currentPassword,
                nuevo_password: passwords.newPassword
            }, 
            {
                headers: { Authorization: `Bearer ${token}` }
            });

        console.log(response.data.data);
        if (response.data.data.mensaje === "001") {
            //setMessage({ text: 'Contraseña actualizada exitosamente', type: 'success' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordFields(false);
            show_alerta('Contraseña actualizada exitosamente', 'success');
        }else{
            show_alerta('Error al cambiar la contraseña', 'error');
        }
    } catch (error) {
      setMessage({ text: 'Error al cambiar la contraseña', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setUser(originalUser);
    setMessage({ text: '', type: '' });
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2> Editar Perfil</h2>
        <p>Actualiza tu información personal</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-content">
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>Información Personal</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre"><FaUser /> Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={user.nombre || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={user.apellido || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cedula"><FaIdCard /> Cédula</label>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={user.cedula || ''}
                  onChange={handleChange}
                  disabled="true"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="usuario">Nombre de Usuario</label>
                <input
                  type="text"
                  id="usuario"
                  name="usuario"
                  value={user.usuario || ''}
                  onChange={handleChange}
                  required
                  disabled="true"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email"><FaEnvelope /> Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email || ''}
                  onChange={handleChange}
                  disabled="true"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="fechaNac"><FaBirthdayCake /> Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="fechaNac"
                  name="fechaNac"
                  value={user.fechaNac || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section" style={{marginTop: "20px"}}>
            <h2>Información de Contacto</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="direccion"><FaMapMarkerAlt /> Dirección</label>
                <textarea
                  id="direccion"
                  name="direccion"
                  value={user.direccion || ''}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefono"><FaPhone /> Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={user.telefono || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="celular">Celular</label>
                <input
                  type="tel"
                  id="celular"
                  name="celular"
                  value={user.celular || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={resetForm} 
              className="btn-secondary"
              disabled={saving}
            >
              <FaUndo /> Revertir Cambios
            </button>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Guardando...' : <><FaSave /> Guardar Cambios</>}
            </button>
          </div>
        </form>

        <div className="password-section">
          <h2>Cambiar Contraseña</h2>
          
          {!showPasswordFields ? (
            <button 
              type="button" 
              onClick={() => setShowPasswordFields(true)}
              className="btn-outline"
            >
              <FaEye /> Cambiar Contraseña
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Contraseña Actual</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div className="password-actions">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordFields(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="info-section">
          <h2>Información Adicional</h2>
          
          <div className="info-grid">
            {/*<div className="info-item">
              <label>Caja de Ahorro:</label>
              <span>{user.cajaAhorro ? user.cajaAhorro.nombre : 'No asignada'}</span>
            </div>*/}
            
            <div className="info-item">
              <label>Fecha de Registro:</label>
              <span>{user.dateCreate ? new Date(user.dateCreate).toLocaleDateString() : 'No disponible'}</span>
            </div>
            
            <div className="info-item">
              <label>Última Actualización:</label>
              <span>{user.dateModified ? new Date(user.dateModified).toLocaleDateString() : 'No disponible'}</span>
            </div>
            
            <div className="info-item">
              <label>Roles:</label>
              <span>
                {user.rol && user.rol.length > 0 
                  ? user.rol.map(rol => rol.rol.rol).join(', ') 
                  : 'No asignados'}
              </span>
            </div>
            
            <div className="info-item">
              <label>Estado:</label>
              <span>{user.estatus === 1 ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilUsuario;