import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import '../assets/css/registroUsuario.css'; 
import { show_alerta } from '../functions';
import { FaBroom, FaTimesCircle, FaEdit, FaPencilAlt, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Cookies from 'universal-cookie';
import { EstatusEnum } from '../util/enum';

const UsuarioSudeca = ({ setCurrentComponent }) => {
  const cookies = new Cookies();
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  
  // Estados para roles
  const [roles, setRoles] = useState([]); // Todos los roles disponibles
  const [selectedRoles, setSelectedRoles] = useState([]); // IDs de roles seleccionados
  
  // Estados para validación
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para almacenar los usuarios registrados
  const [usuarios, setUsuarios] = useState([]);
  
  // Estado para mensajes de éxito/error
  const [message, setMessage] = useState({ type: '', text: '' });

  // Estado para controlar modo edición
  const [editing, setEditing] = useState(false);
  const [currentUsuarioId, setCurrentUsuarioId] = useState(null);

  // Función para cargar roles desde la API
  const cargarRoles = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/rol/roles-master`);
      if (response.data && Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        setMessage({ type: 'error', text: 'Formato de datos inesperado en roles' });
      }
    } catch (error) {
      console.error('Error cargando roles:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al cargar roles: ' + (error.response?.data?.message || error.message)
      });
    }
  };

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!nombre) newErrors.nombre = 'El nombre es requerido';
    if (!apellido) newErrors.apellido = 'El apellido es requerido';
    if (!cedula) newErrors.cedula = 'La cédula es requerida';
    if (!direccion) newErrors.direccion = 'La dirección es requerida';
    if (!telefono && !celular) newErrors.telefonos = 'Al menos un teléfono es requerido';
    
    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    
    // Validar que se haya seleccionado al menos un rol
    if (selectedRoles.length === 0) {
      newErrors.roles = 'Debe seleccionar al menos un rol';
    }
    
    // Validar contraseña solo si no estamos editando o si se cambió
    if (!editing || password) {
      if (!password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirme la contraseña';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Componente para formatear fechas
  const FechaFormateada = ({ fecha }) => {
    const parsearFecha = (fechaStr) => {
      if (!fechaStr) return 'N/A';
      
      try {
        // Detectar formato inusual: 05T04:00:00.000+00:00/05/2000
        if (fechaStr.includes('T') && fechaStr.includes('/')) {
          const partes = fechaStr.split('/');
          if (partes.length === 3) {
            const dia = partes[0].split('T')[0]?.padStart(2, '0');
            const mes = partes[1]?.padStart(2, '0');
            const anio = partes[2];
            return `${dia}/${mes}/${anio}`;
          }
        }
        
        // Formato ISO estándar
        const dateObj = new Date(fechaStr);
        if (!isNaN(dateObj)) {
          return dateObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
        
        return 'Formato inválido';
      } catch (error) {
        return 'Error formato';
      }
    };

    return <span>{parsearFecha(fecha)}</span>;
  };

  // Función para cargar usuarios desde la API
  const cargarUsuarios = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/usuario/get-users-sudeca`);
      if (response.data && Array.isArray(response.data)) {
        setUsuarios(response.data);
      } else {
        setMessage({ type: 'error', text: 'Formato de datos inesperado' });
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al cargar usuarios: ' + (error.response?.data?.message || error.message)
      });
    }
  };

  // Cargar usuarios y roles al montar el componente
  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, [idCaho]);

  // Función para cargar datos de usuario en el formulario para edición
  const cargarUsuarioParaEdicion = (usuario) => {
    setEditing(true);
    setCurrentUsuarioId(usuario.idUsuario);
    
    setNombre(usuario.nombre);
    setApellido(usuario.apellido);
    setCedula(usuario.cedula);
    setDireccion(usuario.direccion);
    setTelefono(usuario.telefono || '');
    setCelular(usuario.celular || '');
    setEmail(usuario.email);
    
    // Cargar roles del usuario si existen
    if (usuario.idRol && usuario.idRol.length > 0) {
      const rolesIds = usuario.rol.map(r => r.rol.idRol);
      setSelectedRoles(rolesIds);
    } else {
      setSelectedRoles('');
    }
    
    // Manejar formato de fecha inusual
    if (usuario.fechaNac) {
      try {
        // Detectar formato inusual
        if (usuario.fechaNac.includes('T') && usuario.fechaNac.includes('/')) {
          const partes = usuario.fechaNac.split('/');
          if (partes.length === 3) {
            const anio = partes[2];
            const mes = partes[1]?.padStart(2, '0');
            const dia = partes[0].split('T')[0]?.padStart(2, '0');
            setFechaNacimiento(`${anio}-${mes}-${dia}`);
          }
        } else {
          // Formato estándar
          const dateObj = new Date(usuario.fechaNac);
          if (!isNaN(dateObj)) {
            setFechaNacimiento(dateObj.toISOString().split('T')[0]);
          }
        }
      } catch (error) {
        console.error('Error parseando fecha:', usuario.fechaNac, error);
      }
    }
    
    // Resetear contraseñas
    setPassword('');
    setConfirmPassword('');
    
    // Desplazar al formulario
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  };

  const checkEmail = async (email) => {
    try {
      const newErrors = {};
      const response = await axios.get(`${config.API_BASE_URL}/api/usuario/get-email`, {
        params: {
          email
        }
      });
      
      if (response.data) {
        //show_alerta(`Usuario exitente`);
        newErrors.email = 'Usuario exitente';
        setErrors(newErrors);
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error('Error al verificar el email:', error);
      //setUserData(null);
      show_alerta('Error al verificar el email');
      return false;
    }
  };

  const checkCI = async (cedula) => {
    try {
      const newErrors = {};
      const response = await axios.get(`${config.API_BASE_URL}/api/usuario/get-cedula`, {
        params: {
          cedula
        }
      });
      
      if (response.data) {
        //show_alerta(`Usuario exitente`);
        newErrors.cedula = 'Cédula exitente';
        setErrors(newErrors);
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error('Error al verificar el cédula:', error);
      //setUserData(null);
      show_alerta('Error al verificar el cédula');
      return false;
    }
  };

  // Función para manejar el envío del formulario (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setMessage({ type: '', text: '' });
      if (!editing) {
        var valEmail = await checkEmail(email)
        if(!valEmail){
          setIsSubmitting(false);
          return false;
        }

        var valCI = await checkCI(cedula)
        if(!valCI){
          setIsSubmitting(false);
          return false;
        }
      }

      try {
        // Construir objeto DTO
        const usuarioDTO = {
          pass: password,
          nombre,
          apellido,
          cedula,
          direccion,
          telefono,
          celular,
          email,
          fechaNac: new Date(fechaNacimiento).toISOString().split('T')[0],
          fechaExpCod: new Date().toISOString().split('T')[0],
          estatus: 1,
          id_caho: idCaho,
          idRol: selectedRoles[0] // Incluir roles seleccionados
        };
        
        let response;
        
        if (editing) {
          // Modo edición: Petición PUT
          response = await axios.put(
            `${config.API_BASE_URL}/api/usuario/update?id=${currentUsuarioId}`,
            usuarioDTO,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        } else {
          // Modo creación: Petición POST
          response = await axios.post(
            `${config.API_BASE_URL}/api/usuario/save-sudeca`,
            usuarioDTO,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        if (response.data.status === "success") {
          show_alerta(editing ? "Usuario actualizado" : "Usuario creado", "success");
          handleLimpiar();
          cargarUsuarios();
        } else {
          throw new Error(response.data?.message || 'Error desconocido');
        }
      } catch (error) {
        console.error('Error guardando usuario:', error);
        setMessage({ 
          type: 'error', 
          text: 'Error al guardar usuario: ' + (error.response?.data?.message || error.message)
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const cambiarEstatus = async (identificador) => {
    try {
      // 1. Obtener el usuario actual para determinar el nuevo estatus
      const usuarioActual = usuarios.find(usuario => usuario.idUsuario === identificador);
      
      if (!usuarioActual) {
        console.error("Usuario no encontrado");
        return;
      }
  
      // 2. Calcular el nuevo estatus (alternar entre 1 y 2)
      const nuevoEstatus = usuarioActual.estatus === 1 ? 2 : 1;

      await axios.put(
        `${config.API_BASE_URL}/api/usuario/${identificador}/estatus`,
        { estatus: parseInt(nuevoEstatus) },  
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      // 4. Actualizar el estado local solo después de confirmación del servidor
      const usuariosTemporal = usuarios.map(usuario => 
        usuario.idUsuario === identificador 
          ? { ...usuario, estatus: nuevoEstatus } 
          : usuario
      );
      setUsuarios(usuariosTemporal);
      
      show_alerta("Estatus del usuario actualizado exitosamente!", "success");
      
    } catch (error) {
      console.error("Error al actualizar el estatus:", error);
    }
  };

  // Función para limpiar el formulario y salir del modo edición
  const handleLimpiar = () => {
    setNombre('');
    setApellido('');
    setCedula('');
    setDireccion('');
    setTelefono('');
    setCelular('');
    setEmail('');
    setFechaNacimiento('');
    setPassword('');
    setConfirmPassword('');
    setSelectedRoles(''); // Limpiar roles seleccionados
    setErrors({});
    
    // Salir del modo edición
    setEditing(false);
    setCurrentUsuarioId(null);
  };

  // Función para regresar
  const handleRegresar = () => {
    setCurrentComponent('moduloAdministracion');
  };

  // Función para eliminar un usuario
  const handleEliminarUsuario = async (idUsuario) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        const response = await axios.delete(`${config.API_BASE_URL}/api/usuario/delete/${idUsuario}`);
        if (response.data.success) {
          setMessage({ type: 'success', text: 'Usuario eliminado exitosamente' });
          cargarUsuarios();
          
          // Si estamos editando el usuario eliminado, limpiar formulario
          if (currentUsuarioId === idUsuario) {
            handleLimpiar();
          }
        } else {
          throw new Error(response.data.message || 'Error al eliminar usuario');
        }
      } catch (error) {
        console.error('Error eliminando usuario:', error);
        setMessage({ 
          type: 'error', 
          text: 'Error al eliminar usuario: ' + (error.response?.data?.message || error.message)
        });
      }
    }
  };

  // Manejar cambio en la selección de roles
  const handleRoleChange = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(parseInt(options[i].value));
      }
    }
    setSelectedRoles(selectedValues);
  };

  return (
    <div className="registro-usuario-container">
      <div className="header">
        {/*
          <button className="regresar-button" onClick={handleRegresar}>
            <span className="icon">←</span> Regresar
          </button>
        */}
        <h2 className="titulo">Módulo de Usuarios Sudeca</h2>
      </div>

      {/* Mensajes de éxito/error */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div id="form-section" className="form-section">
        <form onSubmit={handleSubmit}>
          {/* Fila superior con botones de acción */}
          <div className="form-row top-row" style={{borderBottom: "0.5px solid #ddd", paddingBottom: "20px"}}>
            <div className="form-group fecha-valor">
              <label style={{ fontWeight: "600", color: "#000" }}>
                {editing ? "Editando Usuario" : "Datos Personales"}
              </label>
            </div>
            
            <div className="acciones-top">
              <button 
                type="button" 
                className="clean-button" 
                onClick={handleLimpiar}
                disabled={isSubmitting}
              >
                Limpiar
              </button>
              
              <button 
                type="submit" 
                className="save-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="spinner"></div>
                ) : editing ? (
                  "Modificar Usuario"
                ) : (
                  "Guardar Usuario"
                )}
              </button>
              
              {editing && (
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleLimpiar}
                  disabled={isSubmitting}
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>

          {/* Fila 1: Cédula, Nombre, Apellido */}
          <div className="form-row session_form_1">
            <div className="form-group auxiliar">
              <label htmlFor="cedula">Cédula *</label>
              <div className="input-with-search">
                <input
                  type="text"
                  id="cedula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ingrese cédula"
                  className={errors.cedula ? 'input-error' : ''}
                  disabled={editing}
                  readOnly={editing} // Cédula no editable en modo edición
                />
              </div>
              {errors.cedula && <div className="error-message">{errors.cedula}</div>}
            </div>
            
            <div className="form-group auxiliar">
              <label htmlFor="nombre">Nombre *</label>
              <div className="input-with-search">
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ingrese nombre"
                  className={errors.nombre ? 'input-error' : ''}
                />
              </div>
              {errors.nombre && <div className="error-message">{errors.nombre}</div>}
            </div>
            
            <div className="form-group auxiliar">
              <label htmlFor="apellido">Apellido *</label>
              <div className="input-with-search">
                <input
                  type="text"
                  id="apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ingrese apellido"
                  className={errors.apellido ? 'input-error' : ''}
                />
              </div>
              {errors.apellido && <div className="error-message">{errors.apellido}</div>}
            </div>
          </div>

          {/* Fila 2: Fecha Nacimiento, Email, Teléfonos */}
          <div className="form-row">
            <div className="form-group auxiliar">
              <label htmlFor="fechaNacimiento">Fecha Nacimiento *</label>
              <div className="input-with-search">
                <input
                  type="date"
                  id="fechaNacimiento"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className={errors.fechaNacimiento ? 'input-error' : ''}
                />
              </div>
              {errors.fechaNacimiento && <div className="error-message">{errors.fechaNacimiento}</div>}
            </div>
           
            <div className="form-group auxiliar">
              <label htmlFor="email">Email *</label>
              <div className="input-with-search">
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  disabled={editing}
                  className={errors.email ? 'input-error' : ''}
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group auxiliar">
              <label htmlFor="telefono">Teléfono Fijo</label>
              <div className="input-with-search">
                <input
                  type="text"
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ingrese teléfono fijo"
                />
              </div>
            </div>

            <div className="form-group auxiliar">
              <label htmlFor="celular">Teléfono Celular</label>
              <div className="input-with-search">
                <input
                  type="text"
                  id="celular"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  placeholder="Ingrese teléfono celular"
                />
              </div>
              {errors.telefonos && <div className="error-message">{errors.telefonos}</div>}
            </div>
          </div>

          {/* Fila 3: Roles */}
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="roles">Roles *</label>
              <select
                id="roles"
                value={selectedRoles}
                onChange={handleRoleChange}
                className={`roles-select ${errors.roles ? 'input-error' : ''}`}
                size={4}
              >
                {roles.map(rol => (
                  <option key={rol.idRol} value={rol.idRol}>
                    {rol.rol} - {rol.descripcion}
                  </option>
                ))}
              </select>
              {errors.roles && <div className="error-message">{errors.roles}</div>}
              <div className="roles-hint">
                Es obligatorio seleccionar un rol
              </div>
            </div>
          </div>

          {/* Fila 4: Contraseñas */}
          <div className="form-row">
            <div className="form-group auxiliar">
              <label htmlFor="password">
                Contraseña {editing ? '(Opcional)' : '*'}
              </label>
              <div className="input-with-search">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editing ? "Dejar en blanco para mantener" : "Ingrese contraseña"}
                  className={errors.password ? 'input-error' : ''}
                />
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            <div className="form-group auxiliar">
              <label htmlFor="confirmPassword">
                Repita contraseña {editing ? '(Opcional)' : '*'}
              </label>
              <div className="input-with-search">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={editing ? "Dejar en blanco para mantener" : "Repita contraseña"}
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
              </div>
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
          </div>
          
          {/* Fila 5: Dirección */}
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="direccion">Dirección *</label>
              <div className="input-with-search">
                <textarea
                  id="direccion"
                  rows="3"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ingrese dirección completa"
                  className={errors.direccion ? 'input-error' : ''}
                ></textarea>
              </div>
              {errors.direccion && <div className="error-message">{errors.direccion}</div>}
            </div>
          </div>
        </form>
      </div>

      {/* Tabla de usuarios registrados */}
      <div className="table-section">
        <div className="table-header">
          <h3>Usuarios Registrados</h3>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Cédula</th>
              <th>Roles</th>
              <th>Email</th>
              <th>Fecha Nac.</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr 
                key={usuario.idUsuario} 
                className={currentUsuarioId === usuario.idUsuario ? 'row-editing' : ''}
              >
                <td>{usuario.idUsuario}</td>
                <td>{usuario.usuario}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.apellido}</td>
                <td>{usuario.cedula}</td>
                <td>
                  {usuario.rol && usuario.rol.length > 0 ? 
                    usuario.rol.map(r => r.rol.rol).join(', ') : 
                    'Sin roles asignados'}
                </td>
                <td>{usuario.email}</td>
                <td><FechaFormateada fecha={usuario.fechaNac} /></td>
                <td className="actions-cell">
                  <button 
                    className="edit-button"
                    onClick={() => cargarUsuarioParaEdicion(usuario)}
                    disabled={isSubmitting}
                  >
                    <FaEdit className="edit-icon" />
                  </button>
                  {/*<button 
                    className="delete-button"
                    onClick={() => handleEliminarUsuario(usuario.idUsuario)}
                    disabled={isSubmitting}
                  >
                    <FaTrash className="trash-icon" />
                  </button>*/}

                  <button 
                    className={`status-button ${EstatusEnum(usuario.estatus).toLowerCase()}`}
                    onClick={() => cambiarEstatus(usuario.idUsuario)}>
                    {usuario.estatus === 1 ? 
                      <FaToggleOn size={20} /> : 
                      <FaToggleOff size={20} />
                    }
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Fila vacía si no hay usuarios */}
            {usuarios.length === 0 && !isSubmitting && (
              <tr>
                <td colSpan="9" className="no-data">No hay usuarios registrados</td>
              </tr>
            )}
            
            {/* Mensaje de carga */}
            {isSubmitting && (
              <tr>
                <td colSpan="9" className="loading-data">
                  <div className="spinner"></div> Cargando usuarios...
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="table-footer">
          <div className="pagination">
            <span>Total: {usuarios.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuarioSudeca;