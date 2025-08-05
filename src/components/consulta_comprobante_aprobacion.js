import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/css/consultaComprobante.css'; 
import { show_alerta } from '../functions';
import Swal from 'sweetalert2';
import axios from 'axios';
import config from '../config';
import Cookies from 'universal-cookie';
import { registerLocale } from "react-datepicker";
registerLocale('es', es);

const ConsultaComprobanteAprobacion = ({ 
  setCurrentComponent,
  setComprobanteSeleccionado,
  setIsParamsConsultingUpdate,
  isParamsConsultingUpdate 
}) => {
  const baseUrl = config.API_BASE_URL;
  const cookies = new Cookies();
  
  // Estados para los campos de búsqueda
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  const [userId, setUserId] = useState(cookies.get('idUsuario')); 
  const [fechaRango, setFechaRango] = useState('');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [usuarioBusqueda, setUsuarioBusqueda] = useState('');
  const [estatusBusqueda, setEstatusBusqueda] = useState(0);
  const [estatusBusquedaBTN, setEstatusBusquedaBTN] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [comprobantes, setComprobantes] = useState([]);
  const [selectedComprobantes, setSelectedComprobantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [isStartConsulting, setIsStartConsulting] = useState('');
  
  // Estados para controlar botones
  const [isVerifyEnabled, setIsVerifyEnabled] = useState(false);
  const [isUpdateEnabled, setIsUpdateEnabled] = useState(false);

  const handleChangeComponent = (currents) => {
    setCurrentComponent(currents);
  };

  // Objeto estatus
  const estatus = [
    { idEstatus: 0, descripcion: 'Cargado' },
    { idEstatus: 1, descripcion: 'Verificado' },
    { idEstatus: 2, descripcion: 'Actualizado' },
    { idEstatus: 3, descripcion: 'Cerrado' }
  ];

  // Efecto para actualizar estados de los botones
  useEffect(() => {
    const hasSelected = selectedComprobantes.length > 0;
    
    if (!hasSelected) {
      // Si no hay selección, deshabilitar ambos
      setIsVerifyEnabled(false);
      setIsUpdateEnabled(false);
      return;
    }

    // Habilitar según estatusBusqueda
    if (estatusBusquedaBTN == 0) {
      setIsVerifyEnabled(true);
      setIsUpdateEnabled(false);
    } else if (estatusBusquedaBTN == 1) {
      setIsVerifyEnabled(false);
      setIsUpdateEnabled(true);
    } else {
      // Para otros estatus, deshabilitar ambos
      setIsVerifyEnabled(false);
      setIsUpdateEnabled(false);
    }
  }, [selectedComprobantes, estatusBusquedaBTN]);

  useEffect(() => {
    if(isParamsConsultingUpdate != null && isParamsConsultingUpdate.update == 1){   
        setStartDate(isParamsConsultingUpdate.startDate);
        setEndDate(isParamsConsultingUpdate.endDate)
        setNumeroComprobante(isParamsConsultingUpdate.numeroComprobante)
        setUsuarioBusqueda(isParamsConsultingUpdate.usuarioBusqueda)
        setEstatusBusqueda(isParamsConsultingUpdate.idEstatus)
        setIsStartConsulting(true);
    }
  }, [isParamsConsultingUpdate]);

  useEffect(() => {
    if(isParamsConsultingUpdate !== null && isParamsConsultingUpdate.update === 1 && isStartConsulting == true){    
      handleConsultar();
    }
  }, [isStartConsulting]);

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Función para formatear moneda
  const formatCurrency = (value) => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) return '0,00';
    
    const fixedValue = number.toFixed(2);
    const [integerPart, decimalPart] = fixedValue.split('.');
    
    return integerPart
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      + ',' + decimalPart;
  };

  // Función para manejar selección de comprobantes
  const handleSelectComprobante = (id, isChecked) => {
    if (isChecked) {
      setSelectedComprobantes(prev => [...prev, id]);
    } else {
      setSelectedComprobantes(prev => prev.filter(itemId => itemId !== id));
    }
  };

  // Función para seleccionar/deseleccionar todos
  const handleSelectAllComprobantes = (e) => {
    if (e.target.checked) {
      const allIds = comprobantes.map(c => c.id);
      setSelectedComprobantes(allIds);
    } else {
      setSelectedComprobantes([]);
    }
  };

  const handleConsultar = async () => {
    setLoading(true);
    setIsConsulting(true);
    setError(null);

    try {
      var fechaInicio = null;
      var fechaFin = null;
      if (startDate && endDate) {
        fechaInicio = format(startDate, 'yyyy-MM-dd');
        fechaFin = format(endDate, 'yyyy-MM-dd');
      }
      if(!numeroComprobante){
        setNumeroComprobante(null);
      }
      const paramsUpdate = {
        update:0,
        startDate:startDate,
        endDate:endDate,
        numeroComprobante:numeroComprobante,
        usuarioBusqueda:usuarioBusqueda,
        idEstatus: estatusBusqueda,
        screamConsultingComprobante:2
      }
      setIsParamsConsultingUpdate(paramsUpdate);
      
      const response = await axios.get(`${baseUrl}/api/comprobante/lista-por-filtro`, {
        params : {
          idCaho:idCaho,
          fechaInicio:fechaInicio,
          fechaFin:fechaFin,
          nroComprobante:numeroComprobante,
          nombreUsuario:usuarioBusqueda,
          idEstatus: estatusBusqueda 
        }
      });
      const data = response.data;

      if (!data) {
        show_alerta(response.data?.message || "Error al realizar consulta", "error");
      }
      
      // Mapear los datos de la API al formato de la tabla
      const comprobantesMapeados = data.map(comprobante => ({
        id:comprobante.id,
        secuencia: comprobante.id.toString().padStart(6, '0'),
        fechaValor: formatDate(comprobante.fechaCbte),
        usuario: comprobante.usuarioCreacion?.nombre || 'N/A',
        debitos: formatCurrency(comprobante.bsMontoDebito),
        creditos: formatCurrency(comprobante.bsMontoCredito),
        comprobante: comprobante.nroCbte,
        fechaCbte:comprobante.fechaCbte,
        idCaho:comprobante.idCaho,
        nroCbte:comprobante.nroCbte,
        estatusCbte:comprobante.estatusCbte,
        comprobanteDet: comprobante.comprobanteDet
      }));
      
      setComprobantes(comprobantesMapeados);
      setSelectedComprobantes([]); // Resetear selección
      setEstatusBusquedaBTN(estatusBusqueda);
    } catch (err) {
      console.error('Error al consultar comprobantes:', err);
      setError('Error al cargar los datos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
      setIsConsulting(false);
    }
  };

  // Método para verificar comprobantes
  const handleVerificarComprobantes = async () => {
    // Validar que haya comprobantes seleccionados
    if (selectedComprobantes.length === 0) {
      show_alerta("Por favor seleccione al menos un comprobante", "warning");
      return;
    }
  
    try {
      // Esperar la confirmación del usuario
      const result = await Swal.fire({
        title: 'Atención',
        text: "¿Está seguro de verificar los comprobantes seleccionados?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, verificar!'
      });
  
      // Si el usuario cancela, salir de la función
      if (!result.isConfirmed) {
        return;
      }
  
      setLoading(true);
      
      // Construir el payload
      const payload = {
        idUsuario: userId,
        comprobantes: selectedComprobantes.map(id => ({ idComprobante: id }))
      };
  
      console.log("Payload:", payload);
      
      // Enviar solicitud al endpoint
      const response = await axios.post(
        `${baseUrl}/api/comprobante/verificar-comprobante`,
        payload
      );
  
      console.log("Respuesta:", response.data);
      
      if (response.data.data) {
        show_alerta("Comprobantes verificados exitosamente", "success");
        // Actualizar la lista de comprobantes
        await handleConsultar();
      } else {
        show_alerta("No se pudieron verificar algunos comprobantes, valide que estén cuadrados", "error");
      }
    } catch (err) {
      console.error('Error al verificar comprobantes:', err);
      show_alerta("Error al verificar comprobantes", "error");
    } finally {
      setLoading(false);
    }
  };
  // Método para verificar comprobantes
  const handleActualizarComprobantes = async () => {
    // Validar que haya comprobantes seleccionados
    if (selectedComprobantes.length === 0) {
      show_alerta("Por favor seleccione al menos un comprobante", "warning");
      return;
    }

    // Confirmar con el usuario
    // Esperar la confirmación del usuario
    const result = await Swal.fire({
      title: 'Atención',
      text: "¿Está seguro de actualizar los comprobantes seleccionados?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, verificar!'
    });

    // Si el usuario cancela, salir de la función
    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    console.log(selectedComprobantes);
    
    try {
      // Construir el objeto con la lista de IDs
      //const requestData = selectedComprobantes.map(id => (id));
      /*const payload = {
        idUsuario:userId,
        comprobantes: selectedComprobantes.map((id, index) => ({
          idComprobante: id 
        }))
      };
      
      console.log("lista: ", payload);*/
      const payload = {
        idUsuario: userId,
        comprobantes: selectedComprobantes.map(id => ({ idComprobante: id }))
      };
      
      // Enviar solicitud al endpoint
      const response = await axios.post(`${baseUrl}/api/comprobante/actualizar-comprobante`, 
        payload
      );
      console.log("response.data------------- ", response.data);
      if (response.data.data) {
        show_alerta("Comprobantes actualizado exitosamente", "success");
        // Actualizar la lista de comprobantes
        await handleConsultar();
      } else {
        show_alerta("No se pudieron actualizar algunos comprobantes", "error");
      }
    } catch (err) {
      console.error('Error al actualizar comprobantes:', err);
      show_alerta("Error al actualizar comprobantes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegresar = () => {
    handleChangeComponent('moduloContabilidad');
  };

  // Manejador de cambio de rango de fechas
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    if (start && end) {
      const formattedStart = format(start, 'dd/MM/yyyy');
      const formattedEnd = format(end, 'dd/MM/yyyy');
      setFechaRango(`${formattedStart} - ${formattedEnd}`);
    } else {
      setFechaRango('');
    }
  };

  // Edición
  const handleOpenDetail = (comprobante) => {
    setComprobanteSeleccionado(comprobante);
    setCurrentComponent('detalleComprobantes');
  };

  return (
    <div className="consulta-comprobantes-container">
  
      <div className="header">
        <button className="regresar-button" onClick={() => handleRegresar()}>
          <span className="icon">←</span> Regresar
        </button>
        <h2 className="titulo">Listado de Aprobación y Actualización</h2>
      </div>

      {/* Sección de Búsqueda/Filtros */}
      <section className="search-filters-section">
        <div className="form-group">
          <label htmlFor="estatusBusqueda">Estatus</label>
          <div className='input-with-icon'>
            <select
              id="estatusBusqueda"
              value={estatusBusqueda}
              onChange={(e) => setEstatusBusqueda(e.target.value)}
              className="custom-select"
            >
              {estatus.map(item => (
                <option key={item.idEstatus} value={item.idEstatus}>
                  {item.descripcion}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="fechaRango">Fecha (Desde - Hasta)</label>
          <div className="date-range-picker">
            <DatePicker
              id="fechaRango"
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              locale={es}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY - DD/MM/YYYY"
              className="custom-datepicker-input"
              wrapperClassName="date-picker-wrapper"
            />
            <span className="icon-calendar">📅</span>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="numeroComprobante">Número de Comprobante</label>
          <div className="input-with-icon">
            <input
              type="text"
              id="numeroComprobante"
              placeholder="000000000"
              value={numeroComprobante}
              onChange={(e) => setNumeroComprobante(e.target.value)}
            />
            <button className="search-icon-button">🔍</button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="usuarioBusqueda">Usuario</label>
          <div className="input-with-icon">
            <input
              type="text"
              id="usuarioBusqueda"
              placeholder="Ingrese el nombre del usuario"
              value={usuarioBusqueda}
              onChange={(e) => setUsuarioBusqueda(e.target.value)}
            />
            <button className="search-icon-button">🔍</button>
          </div>
        </div>

        <button 
          className="consultar-button" 
          onClick={handleConsultar}
          disabled={isConsulting}
        >
          {isConsulting ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              Consultando...
            </div>
          ) : (
            'Consultar'
          )}
        </button>

      </section>
      
      <div className="acciones-top">
        <button 
          className="save-button" 
          disabled={!isUpdateEnabled}
          onClick={handleActualizarComprobantes}
        >
          Actualizar Comprobante
        </button>
        
        <button 
          className="review-button"
          disabled={!isVerifyEnabled}
          onClick={handleVerificarComprobantes}
        >
          Verificar Comprobantes
        </button>
      </div>
      
      {/* Sección de la Tabla */}
      <section className="table-section">
        <table>
          <thead>
            <tr>
              <th>Secuencia</th>
              <th>Fecha Valor</th>
              <th>Usuario</th>
              <th>Débitos</th>
              <th>Créditos</th>
              <th>Comprobante</th>
              <th>Estatus</th>
              <th>Acciones</th>
              <th>
                <input 
                  type="checkbox"
                  onChange={handleSelectAllComprobantes}
                  checked={selectedComprobantes.length === comprobantes.length && comprobantes.length > 0}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {comprobantes.map((item) => (
              <tr key={item.id}>
                <td>{item.secuencia}</td>
                <td>{item.fechaValor}</td>
                <td>{item.usuario}</td>
                <td className="text-right">{item.debitos}</td>
                <td className="text-right">{item.creditos}</td>
                <td>{item.comprobante}</td>
                <td className={`status-button 
                                ${item.estatusCbte == 0 ? 'cargado' : ''} 
                                ${item.estatusCbte == 1 ? 'verificado' : ''} 
                                ${item.estatusCbte == 2 ? 'aprobado' : ''}
                                ${item.estatusCbte == 3 ? 'cerrado' : ''}
                                `}>
                  {item.estatusCbte == 0 ? 'Cargado' : ''}
                  {item.estatusCbte == 1 ? 'Verificado' : ''}
                  {item.estatusCbte == 2 ? 'Actualizado' : ''}
                  {item.estatusCbte == 3 ? 'Cerrado' : ''}
                </td>
                <td className="eye-icon-cell">
                  <span className="eye-icon" onClick={() => handleOpenDetail(item)}>👁️</span>
                </td>
                <td>
                  <input 
                    type="checkbox"
                    checked={selectedComprobantes.includes(item.id)}
                    onChange={(e) => handleSelectComprobante(item.id, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
            {/* Filas vacías */}
            {Array.from({ length: Math.max(0, 10 - comprobantes.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Pie de Tabla / Paginación */}
      <footer className="table-footer">
        <div className="pagination">
          <span>1/20</span> <span className="arrow-icon">&gt;</span>
        </div>
      </footer>
    </div>
  );
};

export default ConsultaComprobanteAprobacion;