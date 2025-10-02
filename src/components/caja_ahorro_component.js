import React,{useEffect, useState,useRef} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { show_alerta } from '../functions';
import { FaBroom, FaTimesCircle, FaEdit, FaPencilAlt, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import '../assets/css/cajaAhorro.css'; 
import Cookies from 'universal-cookie';
import { EstatusEnum } from '../util/enum';
import config from '../config';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//import { registerLocale } from "react-datepicker";
//import es from 'date-fns/locale/es';
//registerLocale('es', es);

function CajaAhorro() {
        const cookies = new Cookies();
        const baseUrl = config.API_BASE_URL;
        const [idCaho, setIdCaho] = useState(null);
        const [currentCaja, setCurrentCaja] = useState(null);
        const [isSearching, setIsSearching] = useState(false);
        const [isDisabled, setIsDisabled] = useState(false);
        const [isModoEdit, setIsModoEdit] = useState(false);
        const [isModoFind, setIsModoFind] = useState(false);
        const [ultimoMesCerrado, setUltimoMesCerrado] = useState('');
        const [lapsoGenerado, setLapsoGenerado] = useState('');
        const [roles, setRoles] = useState('');
        const [pplanContable, setPPlanContable] = useState('');
        const [lapsoCierre, setLapsoCierre] = useState('');
        const [categories, setCategories] = useState([]);
        const [allCategories, setAllCategories] = useState([]); // Todas las categorías
        const [filteredCategories, setFilteredCategories] = useState([]); // Categorías filtradas
        const [selectedCategories, setSelectedCategories] = useState([]);
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [searchQuery, setSearchQuery] = useState('');
        const dropdownRef = useRef(null);
        const [nombreMaster, setNombreMaster] = useState("");
        const [correoMaster, setCorreoMaster] = useState("");
        const [passMaster, setPassMaster] = useState("");
        const [nombreConsejo, setNombreConsejo] = useState("");
        const [correoConsejo, setCorreoConsejo] = useState("");
        const [passConsejo, setPassConsejo] = useState("");
        const [nombreCumplimiento, setNombreCumplimiento] = useState("");
        const [correoCumplimiento, setCorreoCumplimiento] = useState("");
        const [passCumplimiento, setPassCumplimiento] = useState("");
        const [usuarios, setUsuarios] = useState([]);
        const [isSaving, setIsSaving] = useState(false);
        const [correoMaster_, setCorreoMaster_] = useState(false);
        const [correoConsejo_, setCorreoConsejo_] = useState(false);
        const [correoCumplimiento_, setCorreoCumplimiento_] = useState(false);
        const [errorPasswordCum, setErrorPasswordCum] = useState(false);
        const [errorPasswordCo, setErrorPasswordCo] = useState(false);
        const [errorPasswordMa, setErrorPasswordMa] = useState(false);
        const [msjPasswordCum, setMsjPasswordCum] = useState('');
        const [msjPasswordCo, setMsjPasswordCo] = useState('');
        const [msjPasswordMa, setMsjPasswordMa] = useState('');
        const [userId, setUserId] = useState(cookies.get('idUsuario')); 
        const [startDate, setStartDate] = useState(null);
        const [endDate, setEndDate] = useState(null);
        const [token, setToken] = useState(cookies.get('token'));
        const [sector, setSector] = useState(1); // 1 para privado, 0 para público
        const [idPlanContable, setIdPlanContable] = useState(1); 
        const [isBloqueado, setIsBloqueado] = useState(false);
        const [errores, setErrores] = useState({
          codigo: false,
          rif: false,
          rifFormat: false,
          rifExit: false,
          nombre: false,
          patrono: false,
          sector: false,
          mesCierre: false,
          lapsoCierre: false,
          ultimoMes: false,
          vigenciaInicio: false,
          vigenciaFin: false,
          categorias: false,
          usuarios: false,
          planContable: false
        });
        
        useEffect(() => {
          limpiarFormulario();

          if(cookies.get('permisologia') != 1){
            setIsDisabled(true);
            setIsBloqueado(true);
          }
        }, []);

        // Obtener plantilla plan contable al montar el componente
        useEffect(() => {
          const fetchPPContable = async () => {
              try {
                  const response = await axios.get(baseUrl + '/api/cajas-ahorro/lista-pplan-contable', {
                    headers: token ? { Authorization: `${token}` } : {}
                  });
                  setPPlanContable(response.data.data);
                  console.log("pplan contable",response.data.data)
              } catch (error) {
                  show_alerta('Error al cargar el plan contable', 'error');
              }
          };
          fetchPPContable();
        }, []);

        // Obtener Roles al montar el componente
        useEffect(() => {
            const fetchRoles = async () => {
                try {
                    const response = await axios.get(baseUrl + '/api/rol/roles-caja');
                    setRoles(response.data);
                    console.log("roles 0",response.data)
                } catch (error) {
                    show_alerta('Error al cargar roles', 'error');
                }
            };
            fetchRoles();
        }, []);

        // Obtener categorías al montar el componente
        useEffect(() => {
            const fetchCategories = async () => {
                try {
                    const response = await axios.get(baseUrl + '/api/categories');
                    setAllCategories(response.data);
                    setFilteredCategories(response.data); // Inicializar con todas las categorías
                } catch (error) {
                    show_alerta('Error al cargar categorías', 'error');
                }
            };
            fetchCategories();
        }, []);

        // Filtrar categorías localmente
        useEffect(() => {
            const filtered = allCategories.filter(categoria => {
            const searchLower = searchQuery.toLowerCase();
            return (
                categoria.codCategoria.toLowerCase().includes(searchLower) ||
                categoria.descCategoria.toLowerCase().includes(searchLower))
            });
            setFilteredCategories(filtered);
        }, [searchQuery, allCategories]);

        // Filtra por código o descripción
        const filtered = allCategories.filter(categoria => {
            const searchLower = searchQuery.toLowerCase();
            return (
            categoria.codCategoria.toLowerCase().includes(searchLower) ||
            categoria.descCategoria.toLowerCase().includes(searchLower)
            );
        });
       
        // Manejar selección de categoría
        const handleCategoriaSelect = (categoria) => {
            if (!selectedCategories.some(c => c.idCategoria === categoria.idCategoria)) {
              const nuevasCategorias = [...selectedCategories, categoria];
              setSelectedCategories(nuevasCategorias);

              // Limpiar error de categorías si se selecciona al menos una
              if (nuevasCategorias.length > 0) {
                limpiarError('categorias');
              }
            }
            setIsDropdownOpen(false);
        };

        // Eliminar categoría seleccionada
        const removeCategoria = (categoriaId) => {
            const nuevasCategorias = selectedCategories.filter(c => c.idCategoria !== categoriaId);
            setSelectedCategories(nuevasCategorias);

            // Si no quedan categorías, volver a mostrar error
            if (nuevasCategorias.length === 0) {
              setErrores(prev => ({ ...prev, categorias: true }));
            }
        };

        // Método para agregar usuarios a la tabla
        const agregarUsuarioMaster = async () => {
            var valPass = validarPassword(passMaster);
            
            if(!valPass.valido){
              setErrorPasswordMa(true);
              setMsjPasswordMa(valPass.mensaje);
              return;
            }

            if (!nombreMaster || !correoMaster) {
                show_alerta("Todos los campos son requeridos", "error");
                return;
            }
            
            if (!/\S+@\S+\.\S+/.test(correoMaster)) {
                show_alerta("Correo electrónico inválido", "error");
                return;
            }

            var valEmail = await checkEmail(correoMaster);
            if (valEmail){
              var rolMaster = 2;
              agregarUsuario(nombreMaster, correoMaster,passMaster, rolMaster);
            
              // Resetear campos
              setNombreMaster("");
              setCorreoMaster("");
              setPassMaster("");
              setCorreoMaster_(false);
              setErrorPasswordMa(false);
              limpiarError('usuarios');
            }else{
              setCorreoMaster_(true);
            }
        }

        const agregarUsuarioConsejo = async () => {
            var valPass = validarPassword(passConsejo);
          
            if(!valPass.valido){
              setErrorPasswordCo(true);
              setMsjPasswordCo(valPass.mensaje);
              return;
            }

            if (!nombreConsejo || !correoConsejo) {
                show_alerta("Todos los campos son requeridos", "error");
                return;
            }
            
            if (!/\S+@\S+\.\S+/.test(correoConsejo)) {
                show_alerta("Correo electrónico inválido", "error");
                return;
            }

            const valEmail = await checkEmail(correoConsejo)
            if (valEmail){
              agregarUsuario(nombreConsejo, correoConsejo,passConsejo, 4);
              // Resetear campos
              setNombreConsejo("");
              setCorreoConsejo("");
              setPassConsejo("");
              setCorreoConsejo_(false);
              setErrorPasswordCo(false);
              limpiarError('usuarios');
            }else{
              setCorreoConsejo_(true);
            }
        }

        const agregarUsuarioCumplimiento = async () => {
            var valPass = validarPassword(passCumplimiento);
            if(!valPass.valido){
              setErrorPasswordCum(true);
              setMsjPasswordCum(valPass.mensaje);
              return;
            }

            if (!nombreCumplimiento || !correoCumplimiento) {
                show_alerta("Todos los campos son requeridos", "error");
                return;
            }
            
            if (!/\S+@\S+\.\S+/.test(correoCumplimiento)) {
                show_alerta("Correo electrónico inválido", "error");
                return;
            }

            // Validar primero en la lista local
            /*if (validarCorreoEnLista(correoCumplimiento)) {
              setCorreoMaster_(true);
              show_alerta("El correo ya está en uso en esta caja", "error");
              return;
            }*/
            const valEmail = await checkEmail(correoCumplimiento);
            console.log(correoCumplimiento)
            if (valEmail){
              agregarUsuario(nombreCumplimiento, correoCumplimiento,passCumplimiento, 5);
              // Resetear campos
              setNombreConsejo("");
              setCorreoConsejo("");
              setPassConsejo("");
              setCorreoCumplimiento_(false);
              limpiarError('usuarios');
              setNombreCumplimiento("");
              setCorreoCumplimiento("");
              setPassCumplimiento("")
              setErrorPasswordCum(false);
            }else{
              setCorreoCumplimiento_(true);
            }
            
            // Resetear campos
            /*;*/
        }

        /*const agregarUsuario = (nombreParam, correoParam,passParam, rolParam) => {
            
            const nuevoUsuario = {
                idUsuario:null,
                identificador: Date.now(), // ID único temporal
                nombre: nombreParam,
                correo: correoParam,
                rol: getRolPorCodigo(rolParam),
                pass:passParam,
                estatus: 1
            };
      
            setUsuarios([...usuarios, nuevoUsuario]);
          
            // Mostrar alerta
            show_alerta("Usuario agregado correctamente", "success");
        };*/

        const agregarUsuario = (nombreParam, correoParam, passParam, rolParam) => {
          const nuevoRol = getRolPorCodigo(rolParam);
          
          // Crear copia del array actual de usuarios
          const nuevosUsuarios = [...usuarios];
          
          // Buscar usuarios existentes con el mismo rol
          const usuariosMismoRol = nuevosUsuarios.filter(
              usuario => usuario.rol.idRol === nuevoRol.idRol
          );
          
          // Si hay usuarios con el mismo rol, marcarlos como inhabilitados (estatus 2)
          usuariosMismoRol.forEach(usuarioExistente => {
              usuarioExistente.estatus = 2;
          });
          
          // Crear el nuevo usuario con estatus activo (1)
          const nuevoUsuario = {
              idUsuario: null,
              identificador: Date.now(), // ID único temporal
              nombre: nombreParam,
              correo: correoParam,
              rol: nuevoRol,
              pass: passParam,
              estatus: 1
          };
          
          // Agregar el nuevo usuario a la lista
          nuevosUsuarios.push(nuevoUsuario);
          
          // Actualizar el estado
          setUsuarios(nuevosUsuarios);
          
          // Mostrar alerta
          show_alerta("Usuario agregado correctamente", "success");
        };
      
        const eliminarUsuario = (identificador) => {
            Swal.fire({
              title: '¿Estás seguro?',
              text: "¡No podrás revertir esta acción!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Sí, eliminar!'
            }).then((result) => {
              if (result.isConfirmed) {
                const nuevosUsuarios = usuarios.filter(usuario => usuario.identificador !== identificador);
                setUsuarios(nuevosUsuarios);
                console.log(nuevosUsuarios)
                show_alerta('Usuario eliminado correctamente', 'success');
              }
            });
        };

        const cambiarEstatus = (identificador) => {
            const nuevosUsuarios = usuarios.map(usuario => {
              if (usuario.identificador === identificador) {
                return {
                  ...usuario,
                  estatus: usuario.estatus === 1 ? 2 : 1
                };
              }
              return usuario;
            });
            setUsuarios(nuevosUsuarios);
        };
  
        // Función para seleccionar rol por código
        const getRolPorCodigo = (codigoBuscado) => {
          const codigo = parseInt(codigoBuscado);
          
          if (isNaN(codigo)) {
            console.error("Código inválido");
            return null
          }

          const rolEncontrado = roles.find(r => parseInt(r.codigo) === codigo);
          
          if (rolEncontrado) {
            return rolEncontrado;
          } else {
            console.warn(`No se encontró rol con código: ${codigo}`);
            return null;
          }
        };

        const hiddenSelct = () => {
            if (isDropdownOpen){
                setIsDropdownOpen(false);
            }
        };

        // Función para manejar el cambio de input
        const handleUltimoMesChange = (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Elimina todo lo que no sea número
            if (value.length > 6) return; // Máximo 6 dígitos (MMYYYY)
            
            // Formatea automáticamente mientras escribe
            if (value.length >= 2) {
                const month = value.substring(0, 2);
                const year = value.substring(2, 6);
                value = `${month}${year ? `/${year}` : ''}`;
            }
            
            // Validación de mes (01-12)
            if (value.length >= 2) {
                const month = parseInt(value.substring(0, 2));
                if (month < 1 || month > 12) {
                show_alerta("El mes debe estar entre 01 y 12", "error");
                return;
                }
            }
            
            setUltimoMesCerrado(value);
        };

        const handleLapsoChange = (e) => {
            const value = e.target.value
              .replace(/\D/g, '') // Elimina todo lo que no sea dígito
              .slice(0, 2); // Limita a máximo 2 caracteres
          
            setLapsoCierre(value);
        };
        
        /**
       * Valida un RIF según las normas venezolanas.
       * @param {string} rif - RIF a validar (ej: "J-123456789")
       * @returns {boolean} - `true` si es válido, `false` si no.
       */
        const validaRIF = (rif) => {
          try {
            // Normalizar: eliminar caracteres no alfanuméricos y convertir a mayúsculas
            const cleanedRIF = rif.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            
            // Validar longitud mínima
            if (cleanedRIF.length < 2) return false;
        
            const typeChar = cleanedRIF.charAt(0);
            const rest = cleanedRIF.substring(1); // Parte después de la letra
        
            // Validar tipo de RIF
            const validTypes = ['V', 'E', 'J', 'P', 'G', 'C'];
            if (!validTypes.includes(typeChar)) return false;
        
            // Validar que la parte restante sean dígitos (2-9 caracteres)
            if (!/^\d{2,9}$/.test(rest)) return false;
        
            // Separar base y dígito verificador
            const baseDigits = rest.substring(0, rest.length - 1);
            const checkDigit = parseInt(rest.charAt(rest.length - 1), 10);
        
            // Rellenar con ceros a la izquierda para completar 8 dígitos
            const paddedBase = baseDigits.padStart(8, '0');
        
            // Factores de ponderación
            const weightFactors = [3, 2, 7, 6, 5, 4, 3, 2];
            const typeWeights = { 
              V: 1, E: 2, J: 3, P: 4, G: 5, C: 3 
            };
            
            // Calcular suma ponderada
            let sum = 0;
            for (let i = 0; i < 8; i++) {
              sum += parseInt(paddedBase.charAt(i), 10) * weightFactors[i];
            }
            
            // Agregar peso del tipo
            sum += typeWeights[typeChar] * 4;
        
            // Calcular dígito verificador
            let calculatedCDV = 11 - (sum % 11);
            
            // Ajustar casos especiales
            if (calculatedCDV === 11 || calculatedCDV === 10) calculatedCDV = 0;
        
            return calculatedCDV === checkDigit;
          } catch (error) {
            console.error("Error validando RIF:", error);
            return false;
          }
        };
        
        const validarPassword = (password) => {
          // 1. Verificar longitud
          if (password.length < 15) {
            return {
              valido: false,
              mensaje: "La contraseña debe tener al menos 15 caracteres"
            };
          }
          
          // 2. Verificar caracteres permitidos
          const caracteresPermitidos = /^[a-zA-Z0-9!#$%&*_.-]+$/;
          if (!caracteresPermitidos.test(password)) {
            return {
              valido: false,
              mensaje: "Caracteres inválidos. Solo se permiten: letras, números y !#$%&*._-"
            };
          }
          
          // 3. Verificar mayúscula
          if (!/[A-Z]/.test(password)) {
            return {
              valido: false,
              mensaje: "Debe contener al menos una letra mayúscula"
            };
          }
          
          // 4. Verificar caracteres repetidos
          if (/(.)\1\1/.test(password)) {
            return {
              valido: false,
              mensaje: "No puede tener tres caracteres idénticos consecutivos"
            };
          }
          
          return {
            valido: true,
            mensaje: "Contraseña válida"
          };
        };

        const guardarDatos = async () => {

            if (await validarCampos()) {
              show_alerta("Por favor verifique los campos", "error");
              return;
            }

            setIsSaving(true);
            const codigoCaho = document.getElementById('codigo').value;
            const rif = document.getElementById('rif').value;
            const nombre = document.getElementById('nombre-caja').value;
            const patrono = document.getElementById('patrono').value;
            /*const publico = document.getElementById('publico').checked;
            const privado = document.getElementById('privado').checked;*/
            const privado = sector === 1;
            const mesCierre = parseInt(document.getElementById('mes-cierre').value);
            
            // Convertir fechas de vigencia
            /*const inicioVigenciaInputs = document.querySelectorAll('.date-range-input input');
            const inicioVigencia = convertToISO(inicioVigenciaInputs[0].value);
            const finVigencia = convertToISO(inicioVigenciaInputs[1].value);*/
            const inicioVigencia = convertToISO(startDate);
            const finVigencia = convertToISO(endDate);
            
            const lapsoGenerado = document.getElementById('lapso-generado').value;

            // Construir payload base
            const payload = {
                codigoCaho: codigoCaho, 
                rif: rif,
                nombre: nombre,
                patrono: patrono,
                descripcion: nombre,
                sector: privado ? 1 : 0,
                periodosEjercicio: 12,
                ultimoMesCerrado: convertUltimoMes(ultimoMesCerrado),
                ultimoPeriodoCerrado: 12,
                mesCierre: mesCierre,
                lapsoCierreMensual: parseInt(lapsoCierre) || 15,
                idMonedaLocal: 1,
                cuentaGananciasPerdidas: "000-000-000",
                inicioVigencia: inicioVigencia,
                finVigencia: finVigencia,
                ultimoLapsoGenerado: convertToISO(lapsoGenerado),
                estatus: 1,
                idPPlanContable:idPlanContable
            };
        
            console.log("lapsoGenerado",payload)
            try {
                if (isModoEdit && currentCaja) {
                    console.log(
                        "isModoEdit",payload
                    )
                    // Modo edición - usar PUT
                    await modificarDatos(payload);
                    
                    // Actualizar la caja actual con los nuevos datos
                    setCurrentCaja({
                        ...currentCaja,
                        ...payload,
                        categorias: selectedCategories,
                        usuarios: usuarios
                    });
                    
                    // Desactivar edición
                    setIsDisabled(true);
                    setIsModoEdit(false);
                } else {
                    // Modo creación - usar POST
                    payload.usuarioCreacion = userId;
                    payload.categorias = selectedCategories.map(cat => ({
                        idCategoria: cat.idCategoria
                    }));
                    payload.usuarios = usuarios.map(usuario => ({
                        nombre: usuario.nombre,
                        email: usuario.correo,
                        pass: usuario.pass,
                        estatus: usuario.estatus,
                        rol: usuario.rol
                    }));
        
                    const response = await axios.post(
                        `${baseUrl}/api/cajas-ahorro`, 
                        payload
                    );
                    
                    // Guardar la nueva caja creada
                    setCurrentCaja(response.data);
                    show_alerta("Caja de ahorro creada exitosamente!", "success");
                    limpiarFormulario();
                }
            } catch (error) {
                show_alerta(`Error: ${error.message}`, "error");
            } finally {
                setIsSaving(false);
            }
        };
        
        const modificarDatos = async (payload) => {
            if (!currentCaja) {
                show_alerta("No se ha cargado una caja para modificar", "error");
                return;
            }

            try {
                const response = await axios.put(
                    `${baseUrl}/api/cajas-ahorro`,
                    {
                        ...payload,
                        idCaho: currentCaja.idCaho,
                        usuarioModificacion: userId,
                        categorias: selectedCategories.map(cat => ({
                            idCategoria: cat.idCategoria
                        })),
                        usuarios: usuarios.map(usuario => ({
                            idUsuario: usuario.idUsuario,
                            nombre: usuario.nombre,
                            email: usuario.correo,
                            pass: usuario.pass,
                            estatus: usuario.estatus,
                            rol: usuario.rol
                        }))
                    }
                );
                show_alerta("Caja de ahorro modificada exitosamente!", "success");
                return response.data;
            } catch (error) {
                show_alerta(`Error al modificar caja de ahorro: ${error.message}`, "error");
                throw error;
            }
        };
        
        // Función para convertir formato DD/MM/YYYY a YYYY-MM-DD
        /*const convertToISO = (dateStr) => {
            if (!dateStr) return '';
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        };*/

        const convertToISO = (date) => {
          if (!date) return '';
          
          if (date instanceof Date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
          
          // Mantener compatibilidad con formato string
          if (typeof date === 'string' && date.includes('/')) {
            const [day, month, year] = date.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
          
          return date;
        };

        // Función para convertir formato YYYY-MM-DD a DD/MM/YYYY 
        const convertToISO2 = (dateStr) => {
          if (!dateStr) return '';
          const [year, month, day] = dateStr.split('-');
          return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        };
        
        // Función para convertir MM/YYYY a YYYY-MM-DD (último día del mes)
        const convertUltimoMes = (value) => {
            if (!value) return '2023-12-31';
            const [month, year] = value.split('/');
            const lastDay = new Date(year, month, 0).getDate();
            return `${year}-${month}-${lastDay}`;
        };

        // Método para buscar caja por código o RIF
        const buscarCaja = async (tipo, valor, respuestaCompleta) => {
            if (!valor.trim()) {
              show_alerta(`Ingrese un ${tipo === 'codigo' ? 'código' : 'RIF'} válido`, 'warning');
              return;
            }
          
            setIsSearching(true);
            limpiarAllError();
            try {
              const response = await axios.get(`${baseUrl}/api/cajas-ahorro/buscar`, {
                params: {
                  tipo,
                  valor
                }
              });
              
              if (response.data) {
                if (!respuestaCompleta){
                   return true;
                }
                setIsModoFind(true);//indica que esta modo consulta
                setIsDisabled(true);
                setIsModoEdit(false);
                console.log("buscar data: ",response.data);
                setCurrentCaja(response.data);
                setIdCaho(response.data.idCaho);
                llenarFormulario(response.data);
                show_alerta('Caja de ahorro encontrada', 'success');
              } else {
                if (!respuestaCompleta){
                  return false;
                }
                show_alerta('No se encontró ninguna caja', 'info');
                limpiarFormulario();
              }
            } catch (error) {
              if (!respuestaCompleta){
                return false;
              }
              show_alerta(`Error al buscar caja: ${error.message}`, 'error');
            } finally {
              setIsSearching(false);
            }
        };

        // Método para validar caja por código o RIF cuando se modifica
        const validarCaja = async (tipo, valor, respuestaCompleta) => {
          if (!valor.trim()) {
            show_alerta(`Ingrese un ${tipo === 'codigo' ? 'código' : 'RIF'} válido`, 'warning');
            return;
          }
        
          setIsSearching(true);
          limpiarAllError();
          try {
            const response = await axios.get(`${baseUrl}/api/cajas-ahorro/validar-caja`, {
              params: {
                tipo:tipo,
                valor:valor,
                idCaho:currentCaja.idCaho
              }
            });
            
            if (response.data) {
              if (!respuestaCompleta){
                 return true;
              }
              setIsModoFind(true);//indica que esta modo consulta
              setIsDisabled(true);
              setIsModoEdit(false);
              console.log("buscar data: ",response.data);
              setCurrentCaja(response.data);
              setIdCaho(response.data.idCaho);
            } else {
              if (!respuestaCompleta){
                return false;
              }
            }
          } catch (error) {
            if (!respuestaCompleta){
              return false;
            }
          } finally {
            setIsSearching(false);
          }
        };

        const obtenerFechaCierre = async (fechaUmc) => {
          fechaUmc = convertToISO(`01/${fechaUmc}`);
          try {
            const response = await axios.get(`${baseUrl}/api/cajas-ahorro/cierre`, {
              params: {
                fechaUmc: fechaUmc,
                lapsoCierre: lapsoCierre
              }
            });
            
            // Convertir la respuesta string a objeto Date
            setLapsoGenerado(convertToISO2(response.data));
            return new Date(response.data);
            
          } catch (error) {
            console.error('Error al obtener fecha de cierre:', error);
            throw error;
          }
        };
        
        // Función para llenar el formulario con los datos de la caja
        const llenarFormulario = (caja) => {
            // Campos principales
            document.getElementById('codigo').value = caja.codigoCaho || '';
            document.getElementById('rif').value = caja.rif || '';
            document.getElementById('nombre-caja').value = caja.nombre || '';
            document.getElementById('patrono').value = caja.patrono || '';

            // Sector
            /*document.getElementById('publico').checked = caja.sector === 0;
            document.getElementById('privado').checked = caja.sector === 1;*/
            setSector(caja.sector);
            
            // Fechas y valores numéricos
            document.getElementById('mes-cierre').value = caja.mesCierre?.toString().padStart(2, '0') || '01';
            setLapsoCierre(caja.lapsoCierreMensual?.toString() || '');
            setLapsoGenerado(convertToISO2(caja.ultimoLapsoGenerado?.toString()) || '')
            // Último mes cerrado (formatear)
            if (caja.ultimoMesCerrado) {
              const fecha = new Date(caja.ultimoMesCerrado);
              const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
              const año = fecha.getFullYear();
              setUltimoMesCerrado(`${mes}/${año}`);
            }

            // Vigencia
            /*const vigenciaInputs = document.querySelectorAll('.date-range-input input');
            if (vigenciaInputs.length >= 2) {
              vigenciaInputs[0].value = formatDate(caja.inicioVigencia);
              vigenciaInputs[1].value = formatDate(caja.finVigencia);
            }*/

            // Vigencia
            if (caja.inicioVigencia) {
              setStartDate(new Date(caja.inicioVigencia));
            }
            if (caja.finVigencia) {
              setEndDate(new Date(caja.finVigencia));
            }
            //plan contable
            setIdPlanContable(caja.idPPlanContable);

            // Categorías
            if (caja.categoriaCajaAhorros && Array.isArray(caja.categoriaCajaAhorros)) {
                // Transformar la estructura de datos
                const categoriasFormateadas = caja.categoriaCajaAhorros.map(cc => ({
                  idCategoria: cc.categoria.idCategoria,
                  codCategoria: cc.categoria.codCategoria,
                  descCategoria: cc.categoria.descCategoria
                }));
                
                setSelectedCategories(categoriasFormateadas);
            }
            console.log("usuarios",caja.usuarios);
            if (caja.usuarios && Array.isArray(caja.usuarios)) {
               
              console.log("usuarios 2",caja.usuarios[0].rol[0]);
                const usuarios = caja.usuarios.map(cc => ({
                    idUsuario: cc.idUsuario, 
                    identificador: cc.idUsuario, 
                    nombre: cc.nombre,
                    correo: cc.email,
                    rol: cc.rol[0].rol,
                    pass: cc.pass,
                    estatus: cc.estatus
                }));
                
                setUsuarios(usuarios);
            }
        };
          
         // Función para formatear fechas (YYYY-MM-DD → DD/MM/YYYY)
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const [year, month, day] = dateString.split('T')[0].split('-');
            return `${day}/${month}/${year}`;
        };

        const habilitarEdicion = () => {
            setIsDisabled(false);
            setIsModoEdit(true);
        }

        const limpiarFormulario = () => {
            // Restablecer estados
            setIdCaho(null);
            setCurrentCaja(null);
            setIsSearching(false);
            setIsDisabled(false);
            setIsModoEdit(false);
            setIsModoFind(false);
            setUltimoMesCerrado('');
            setLapsoCierre('');
            setSelectedCategories([]);
            setSearchQuery('');
            setNombreMaster("");
            setCorreoMaster("");
            setPassMaster("");
            setNombreConsejo("");
            setCorreoConsejo("");
            setPassConsejo("");
            setNombreCumplimiento("");
            setCorreoCumplimiento("");
            setPassCumplimiento("");
            setUsuarios([]);
            setLapsoGenerado('');
            setIdPlanContable(0);
            // Limpiar inputs del formulario
            document.getElementById('codigo').value = '';
            document.getElementById('rif').value = '';
            document.getElementById('nombre-caja').value = '';
            document.getElementById('patrono').value = '';
            /*document.getElementById('publico').checked = false;
            document.getElementById('privado').checked = true; */
            setSector(1);
            document.getElementById('mes-cierre').value = '01'; // Valor por defecto
        
            // Limpiar fechas de vigencia
            /*const vigenciaInputs = document.querySelectorAll('.date-range-input input');
            if (vigenciaInputs.length >= 2) {
                vigenciaInputs[0].value = '';
                vigenciaInputs[1].value = '';
            }*/
            setStartDate(null);
            setEndDate(null);
        
            limpiarAllError();
            // Cerrar el dropdown si está abierto
            setIsDropdownOpen(false);
        
            //show_alerta("Formulario limpiado correctamente", "success");
        };

        const checkEmail = async (email) => {
          try {
            //valida primero localmente
            var validacion_email_1 = usuarios.filter(usuario => usuario.correo === email);
            //console.log("validacion_email_1",validacion_email_1);
            if (validacion_email_1.length > 0){
              return false;
            }

            const response = await axios.get(`${baseUrl}/api/usuario/get-email`, {
              params: {
                email
              }
            });
            
            //console.log("data:",response.data);
            if (response.data) {
              show_alerta(`Usuario exitente`);
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

        // Método de validación
        const validarCampos = async () => {
          limpiarAllError();
          var valRIF = !document.getElementById('rif').value.trim(); 
          var _rifFormat = false;
          var _rifExit = false;

          if(!valRIF){
            //valida formato del rif
            if(!validaRIF(document.getElementById('rif').value.trim())){
              _rifFormat = true;
            }
          }

          if(!valRIF){
            //valida que no este en bd
            if (isModoEdit && currentCaja) {
              if(await validarCaja('rif', document.getElementById('rif').value,false)){
                _rifExit = true;
              }
            }else{
              if(await buscarCaja('rif', document.getElementById('rif').value,false)){
                _rifExit = true;
              }
            }
          }

          const nuevosErrores = {
            codigo: !document.getElementById('codigo').value.trim(),
            rif: valRIF,
            rifExit: _rifExit,
            rifFormat: _rifFormat,
            nombre: !document.getElementById('nombre-caja').value.trim(),
            patrono: !document.getElementById('patrono').value.trim(),
            //sector: !document.getElementById('publico').checked && !document.getElementById('privado').checked,
            sector: sector === null || sector === undefined,
            mesCierre: !document.getElementById('mes-cierre').value,
            lapsoCierre: !lapsoCierre,
            ultimoMes: !ultimoMesCerrado,
            categorias: selectedCategories.length === 0,
            usuarios: usuarios.length === 0,
            planContable: idPlanContable === 0
          };

          // Validar fechas de vigencia
          /*const vigenciaInputs = document.querySelectorAll('.date-range-input input');
          nuevosErrores.vigenciaInicio = !vigenciaInputs[0].value.trim();
          nuevosErrores.vigenciaFin = !vigenciaInputs[1].value.trim();*/

          //validación del rif
          nuevosErrores.vigenciaInicio = !startDate;
          nuevosErrores.vigenciaFin = !endDate;
          setErrores(nuevosErrores);

          // Verificar si hay algún error
          return Object.values(nuevosErrores).some(error => error);
        };

        const validarCorreoEnLista = (correo) => {
          const correoLower = correo.toLowerCase().trim();
          return usuarios.some(usuario => 
            usuario.correo.toLowerCase().trim() === correoLower
          );
        };

        const limpiarError = (campo) => {
          setErrores(prev => ({ ...prev, [campo]: false }));
        };

        const limpiarAllError = () => {
            limpiarError('codigo');
            limpiarError('rif');
            limpiarError('rifFormat');
            limpiarError('rifExit');
            limpiarError('nombre');
            limpiarError('patrono');
            limpiarError('sector');
            limpiarError('mesCierre');
            limpiarError('lapsoCierre');
            limpiarError('ultimoMes');
            limpiarError('vigenciaInicio');
            limpiarError('vigenciaFin');
            limpiarError('categorias');
            limpiarError('usuarios');
            limpiarError('planContable');
        };
  return (
    <div className="caja-ahorro-container" onClick={() => hiddenSelct()}>
      <div className="header">
        <button className="regresar-button">← Regresar</button>
        <h2 className="titulo">Crear Caja de Ahorro</h2>
      </div>

      <div className="form-grid-first">
        <div className="form-group codigo">
            <label htmlFor="codigo">Código</label>
            <div className="input-with-search">
                <input type="text" id="codigo" 
                  className={errores.codigo ? 'error-input' : ''} 
                  onChange={() => limpiarError('codigo')}  
                />
                <button 
                  className="search-button"
                  onClick={() => buscarCaja('codigo', document.getElementById('codigo').value,true)}
                  disabled={isSearching}
                >
                  {isSearching ? <div className="mini-spinner"></div> : '🔍'}
                </button>
            </div>
            {errores.codigo && <div className="error-message">Este campo es requerido</div>}
        </div>

        <div className="form-group rif">
            <label htmlFor="rif">RIF</label>
            <div className="input-with-search">
                <input type="text" id="rif" 
                  className={errores.rif ? 'error-input' : ''} 
                  onChange={() => limpiarError('rif')}/>
                <button 
                className="search-button"
                onClick={() => buscarCaja('rif', document.getElementById('rif').value,true)}
                disabled={isSearching}
                >
                {isSearching ? <div className="mini-spinner"></div> : '🔍'}
                </button>
            </div>
            {errores.rif && <div className="error-message">Este campo es requerido</div>}
            {errores.rifFormat && <div className="error-message">Verifique el formato, ejem. J123456789</div>}
            {errores.rifExit && <div className="error-message">Ya se encuentra registrado</div>}
        </div>

        {/*<div className="form-group sector">
          <label htmlFor="sector">Sector</label>
          <div className="checkbox-group">
            <label>
              <input type="checkbox" id="publico" disabled={isDisabled} onChange={() => limpiarError('sector')}/> Público
            </label>
            <label>
              <input type="checkbox" id="privado" defaultChecked disabled={isDisabled} onChange={() => limpiarError('sector')}/> Privado
            </label>
          </div>
          {errores.sector && <div className="error-message">Seleccione un sector</div>}
        </div>*/}

        <div className="form-group sector">
          <label htmlFor="sector">Sector</label>
          <div className="radio-group">
            <label>
              <input 
                type="radio" 
                name="sector" 
                checked={sector === 0}
                onChange={() => {
                  setSector(0);
                  limpiarError('sector');
                }}
                disabled={isDisabled}
              /> Público
            </label>
            <label>
              <input 
                type="radio" 
                name="sector" 
                checked={sector === 1}
                onChange={() => {
                  setSector(1);
                  limpiarError('sector');
                }}
                disabled={isDisabled}
              /> Privado
            </label>
          </div>
          {errores.sector && <div className="error-message">Seleccione un sector</div>}
        </div>
        {!isBloqueado ?
            <div className="form-group acciones">
              <button className={isDisabled ? "editar-button" : "button-disabled"} onClick={habilitarEdicion} disabled={isDisabled ? false : true}><FaPencilAlt style={{ marginRight: "8px" }}/> Editar</button>
              <button className="limpiar-button" onClick={limpiarFormulario}><FaBroom style={{ marginRight: "0.5rem" }}/>  Limpiar</button>
              <button className="inhabilitar-button"><FaTimesCircle style={{ marginRight: "8px" }} />  Inhabilitar</button>
            </div>
          : ''
        }
      </div>  

      <div className="form-grid-second">
        <div className="form-group nombre-caja">
          <label htmlFor="nombre-caja">Nombre de la Caja</label>
          <input type="text" id="nombre-caja" disabled={isDisabled} maxLength={300}
            className={errores.nombre ? 'error-input' : ''} onChange={() => limpiarError('nombre')}/>
          {errores.nombre && <div className="error-message">Este campo es requerido</div>}
        </div>

        <div className="form-group patrono">
          <label htmlFor="patrono">Patrono</label>
          <input type="text" id="patrono" disabled={isDisabled} maxLength={300}
            className={errores.patrono ? 'error-input' : ''} onChange={() => limpiarError('patrono')}/>
          {errores.patrono && <div className="error-message">Este campo es requerido</div>}
        </div>
      </div>

      <div className="form-grid-third">
        <div className="form-group mes-cierre">
        <label htmlFor="mes-cierre">Mes Cierre</label>
        <select 
            id="mes-cierre" 
            defaultValue="12" // Valor por defecto correspondiente a Dic
            //className="mes-select" 
            disabled={isDisabled}
            className={errores.mesCierre ? 'error-input' : ''}
            onChange={() => limpiarError('mesCierre')}
        >
            {[
            { name: 'Enero', value: '01' },
            { name: 'Febrero', value: '02' },
            { name: 'Marzo', value: '03' },
            { name: 'Abril', value: '04' },
            { name: 'Mayo', value: '05' },
            { name: 'Junio', value: '06' },
            { name: 'Julio', value: '07' },
            { name: 'Agosto', value: '08' },
            { name: 'Septiembre', value: '09' },
            { name: 'Octubre', value: '10' },
            { name: 'Noviembre', value: '11' },
            { name: 'Diciembre', value: '12' }
            ].map((month) => (
            <option key={month.value} value={month.value}>
                {month.name}
            </option>
            ))}
          </select>
          {errores.mesCierre && <div className="error-message">Seleccione un mes</div>}
        </div>

        {/* Lapso de Cierre */}
        <div className="form-group lapso-cierre">
          <label htmlFor="lapso-cierre">Lapso de Cierre</label>
          <input
            type="text"
            id="lapso-cierre"
            className={errores.lapsoCierre ? 'error-input' : ''}
            value={lapsoCierre}
            onChange={(e) => {
              handleLapsoChange(e);
              limpiarError('lapsoCierre');
            }}
            disabled={isDisabled}
          />
          {errores.lapsoCierre && <div className="error-message">Este campo es requerido</div>}
        </div>

        {/* Último Mes Cerrado */}
        <div className="form-group ultimo-mes-cerrado">
          <label htmlFor="ultimo-mes-cerrado">Último Mes Cerrado</label>
          <input
            type="text"
            id="ultimo-mes-cerrado"
            className={errores.ultimoMes ? 'error-input' : ''}
            placeholder="MM/YYYY"
            value={ultimoMesCerrado}
            onChange={(e) => {
              handleUltimoMesChange(e);
              limpiarError('ultimoMes');
            }}
            onBlur={(e) => {
              if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(e.target.value)) {
                  show_alerta("Formato inválido. Use MM/YYYY", "error");
              }else{
                if(lapsoCierre > 0){
                  obtenerFechaCierre(document.getElementById('ultimo-mes-cerrado').value)
                }else{
                  show_alerta("El lapso de cierre debe ser mayor a 0", "error");
                }
              }
            }}
          />
          {errores.ultimoMes && <div className="error-message">Este campo es requerido</div>}
        </div>

        <div className="form-group ultimo-mes-cerrado">
            <label htmlFor="lapso-generado">Lapso Generado</label>
            <input
                type="text"
                id="lapso-generado"
                value={lapsoGenerado}
                disabled="true"
            />
        </div>

        {/* Tiempo de Vigencia 
        <div className="form-group tiempo-vigencia">
          <label htmlFor="tiempo-vigencia">Tiempo de Vigencia (Desde - Hasta)</label>
          <div className="date-range-input">
            <input 
              type="text" 
              placeholder="DD/MM/YYYY" 
              className={errores.vigenciaInicio ? 'error-input' : ''}
              disabled={isDisabled}
              onChange={() => limpiarError('vigenciaInicio')}
            />
            <span>-</span>
            <input 
              type="text" 
              placeholder="DD/MM/YYYY" 
              className={errores.vigenciaFin ? 'error-input' : ''}
              disabled={isDisabled}
              onChange={() => limpiarError('vigenciaFin')}
            />
            <button className="calendar-button">📅</button>
          </div>
          {(errores.vigenciaInicio || errores.vigenciaFin) && (
            <div className="error-message">Ambas fechas son requeridas</div>
          )}
        </div>*/}
        <div className="form-group tiempo-vigencia">
          <label htmlFor="tiempo-vigencia">Tiempo de Vigencia (Desde - Hasta)</label>
          <div className="date-range-input">
            <DatePicker
              selected={startDate}
              onChange={date => {
                setStartDate(date);
                limpiarError('vigenciaInicio');
                // Sumar 3 años a la fecha de inicio para la fecha de fin
                if (date) {
                  const newEndDate = new Date(date);
                  newEndDate.setFullYear(newEndDate.getFullYear() + 3);
                  setEndDate(newEndDate);
                } else {
                  setEndDate(null);
                }
              }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              disabled={isDisabled}
              className={`date-input ${errores.vigenciaInicio ? 'error-input' : ''}`}
              wrapperClassName="date-picker-wrapper"
              locale="es"
            />
            <span>-</span>
            <DatePicker
              selected={endDate}
              onChange={date => {
                setEndDate(date);
                limpiarError('vigenciaFin');
              }}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              disabled={isDisabled}
              className={`date-input ${errores.vigenciaFin ? 'error-input' : ''}`}
              wrapperClassName="date-picker-wrapper"
              locale="es"
            />
          </div>
          {(errores.vigenciaInicio || errores.vigenciaFin) && (
            <div className="error-message">Ambas fechas son requeridas</div>
          )}
        </div>
      </div>

    <div className="form-grid-fourth" style={{borderBottom:'none'}}>
      <div className="form-group mes-cierre" style={{width: '100%'}}>
        <label>Plan Contable</label>
        <select 
            id="pplan_contable" 
            defaultValue="" 
            disabled={isModoFind}
            value={idPlanContable}
            className={errores.planContable ? 'error-input' : ''}
            onChange={(e) => {
                setIdPlanContable(e.target.value);
                limpiarError('planContable');
              }}
        >
            <option value="">Seleccione un plan contable</option>
            {pplanContable && pplanContable.map(plan => (
                <option key={plan.idPPlanContable} value={plan.idPPlanContable}>
                    {plan.descripcion}
                </option>
            ))}
        </select>
        {errores.planContable && <div className="error-message">Seleccione un plan contable</div>}
      </div>
    </div>

    <div className="form-grid-fourth">
      
      
      <div className="categoria-caja">
        <label>Categoría de la Caja</label>
        <div 
          //className="custom-multiselect" 
          className={`custom-multiselect ${errores.categorias ? 'error-input' : ''}`}  
          ref={dropdownRef}>
          <div 
            className="selected-tags-input"
            onClick={() => setIsDropdownOpen(true)}
          >
            {selectedCategories.map(categoria => (
              <div key={categoria.idCategoria} className="categoria-tag">
                <span>{categoria.codCategoria} - {categoria.descCategoria}</span>
                <button 
                  type="button"
                  className="remove-tag"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCategoria(categoria.idCategoria);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="text"
              placeholder="Buscar categorías..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => setIsDropdownOpen(true)}
              disabled={isDisabled}
              //onClick={(e) => e.stopPropagation()}
            />
            <span className="dropdown-icon">▼</span>
          </div>
          
          {isDropdownOpen && (
            <div className="categories-dropdown">
            {filteredCategories.length > 0 ? (
                filteredCategories.map(categoria => (
                !selectedCategories.some(c => c.idCategoria === categoria.idCategoria) && (
                    <div
                    key={categoria.idCategoria}
                    className="dropdown-item"
                    onClick={() => handleCategoriaSelect(categoria)}
                    >
                    {categoria.codCategoria} - {categoria.descCategoria}
                    </div>
                )
                ))
            ) : (
                <div className="no-results">
                {searchQuery ? "No hay coincidencias" : "No hay categorías disponibles"}
                </div>
            )}
            </div>
        )}
        </div>
        {errores.categorias && <div className="error-message">Seleccione al menos una categoría</div>}
      </div>
    </div>
      <div className="usuarios-section">
        <div className="usuario-master">
          <h3>Usuario Administrador/Master</h3>
          <div className="usuario-form">
            <div className="form-row">
              <label htmlFor="nombre-master">Nombre y Apellido</label>
              <input type="text" id="nombre-master" defaultValue="" 
                    value={nombreMaster}
                    onChange={(e) => setNombreMaster(e.target.value)} disabled={isDisabled}/>
            </div>
            <div className="form-row">
              <label htmlFor="correo-master">Correo Electrónico</label>
              <input type="email" id="correo-master" autoComplete="off" 
                    value={correoMaster} className={correoMaster_ ? 'error-input' : ''}
                    onChange={(e) => setCorreoMaster(e.target.value)} disabled={isDisabled}/>
              {correoMaster_ && <div className="error-message">El correo ya se encuentra registrado</div>}
            </div>
            <div className="form-row">
              <label htmlFor="contrasena-master">Contraseña Provisional</label>
              <input type="password" id="contrasena-master" disabled={isDisabled}
                value={passMaster}
                onChange={(e) => setPassMaster(e.target.value)}/>
              {errorPasswordMa && <div className="error-message">{msjPasswordMa}</div>}
            </div>
            <button className={isDisabled ?  'disabled-button' : 'crear-button' } onClick={agregarUsuarioMaster} disabled={isDisabled}>Crear</button>
          </div>
        </div>

        <div className="usuario-consejo">
          <h3>Usuario Consejo de Vigilancia</h3>
          <div className="usuario-form">
            <div className="form-row">
              <label htmlFor="nombre-consejo">Nombre y Apellido</label>
              <input type="text" id="nombre-consejo" 
                    value={nombreConsejo} 
                    onChange={(e) => setNombreConsejo(e.target.value)} disabled={isDisabled}/>
            </div>
            <div className="form-row">
              <label htmlFor="correo-consejo">Correo Electrónico</label>
              <input type="email" id="correo-consejo" 
                    value={correoConsejo} className={correoConsejo_ ? 'error-input' : ''}
                    onChange={(e) => setCorreoConsejo(e.target.value)} disabled={isDisabled}/>
                    {correoConsejo_ && <div className="error-message">El correo ya se encuentra registrado</div>}
            </div>
            <div className="form-row">
              <label htmlFor="contrasena-consejo">Contraseña Provisional</label>
              <input type="password" id="contrasena-consejo" disabled={isDisabled}
                value={passConsejo}
                onChange={(e) => setPassConsejo(e.target.value)}/>
              {errorPasswordCo && <div className="error-message">{msjPasswordCo}</div>}
            </div>
            {/*<button className="crear-button-disabled">Crear</button>*/}
            <button className={isDisabled ?  'disabled-button' : 'crear-button' } onClick={agregarUsuarioConsejo} disabled={isDisabled}>Crear</button>
          </div>
        </div>

        <div className="usuario-cumplimiento">
          <h3>Usuario Cumplimiento de Legitimación de Capitales</h3>
          <div className="usuario-form">
            <div className="form-row">
              <label htmlFor="nombre-cumplimiento">Nombre y Apellido</label>
              <input type="text" id="nombre-cumplimiento" 
                    value={nombreCumplimiento}
                    onChange={(e) => setNombreCumplimiento(e.target.value)} disabled={isDisabled}/>
            </div>
            <div className="form-row">
              <label htmlFor="correo-cumplimiento">Correo Electrónico</label>
              <input type="email" id="correo-cumplimiento"  
                    value={correoCumplimiento}
                    onChange={(e) => setCorreoCumplimiento(e.target.value)} disabled={isDisabled}
                    className={correoCumplimiento_ ? 'error-input' : ''}/>
                    {correoCumplimiento_ && <div className="error-message">El correo ya se encuentra registrado</div>}
            </div>
            <div className="form-row">
              <label htmlFor="contrasena-cumplimiento">Contraseña Provisional</label>
              <input type="password" id="contrasena-cumplimiento" disabled={isDisabled}
                    value={passCumplimiento}
                    onChange={(e) => setPassCumplimiento(e.target.value)} />
              {errorPasswordCum && <div className="error-message">{msjPasswordCum}</div>}
            </div>
            <button className={isDisabled ?  'disabled-button' : 'crear-button' } onClick={agregarUsuarioCumplimiento} disabled={isDisabled}>Crear</button>
          </div>
        </div>
      </div>

      <div className="listado-usuarios">
        <h3>Listado de Usuarios</h3>
        {errores.usuarios && <div className="error-message">Debe agregar al menos un usuario</div>}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Nombre y Apellido</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th style={{width: '170px'}}>Estatus</th>
                <th style={{width: '50px'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.identificador}>
                <td>{usuario.identificador}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo}</td>
                <td>{usuario.rol.rol}</td>
                <td className={`estatus ${EstatusEnum(usuario.estatus).toLowerCase()}`}>{EstatusEnum(usuario.estatus)}</td>
                <td style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button disabled={isDisabled}
                    className={`status-button ${EstatusEnum(usuario.estatus).toLowerCase()}`}
                    onClick={() => cambiarEstatus(usuario.identificador)}>
                    {usuario.estatus === 1 ? 
                      <FaToggleOn size={20} /> : 
                      <FaToggleOff size={20} />
                    }
                  </button>
                  {!isModoFind ?
                    <button 
                      className="eliminar-button"
                      onClick={() => eliminarUsuario(usuario.identificador)}>
                      <FaTrash className="trash-icon" />
                    </button>
                    :
                    ''
                  }
                  
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isBloqueado ?
          <div className="footer-actions">
            {/*<button className="exportar-excel-button">Exportar a Excel</button>*/}
            <button 
                onClick={guardarDatos}
                disabled={isDisabled}
                className={isDisabled ?  'guardar-button disabled-button' : 'guardar-button' }  
                >
                {isModoEdit ? (
                    'Modificar'
                ) : 'Guardar'}
                {/*{isSaving ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                ) : 'Guardar'}*/}
            </button>
          </div>
        :''
      }
      

      {isSaving && (
        <div className="overlay">
            <div className="spinner"></div>
        </div>
      )}
    </div>
    
  );
}

export default CajaAhorro;