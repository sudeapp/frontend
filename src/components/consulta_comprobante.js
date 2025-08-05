import React, { useState,useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/css/consultaComprobante.css'; 
import { show_alerta } from '../functions';
import axios from 'axios';
import { parseISO, format as formatDateFns } from 'date-fns';
import config from '../config';
import Cookies from 'universal-cookie';
import { registerLocale } from "react-datepicker";
registerLocale('es', es);
const ConsultaComprobante = ({ setCurrentComponent,setComprobanteSeleccionado,setIsParamsConsultingUpdate,isParamsConsultingUpdate }) => {
  const baseUrl = config.API_BASE_URL;
  const cookies = new Cookies();
  // Estados para los campos de búsqueda
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  const [fechaRango, setFechaRango] = useState('');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [usuarioBusqueda, setUsuarioBusqueda] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [isStartConsulting, setIsStartConsulting] = useState('');

  const handleChangeComponent = (currents) => {
    setCurrentComponent(currents);
  };


  useEffect(() => {
    if(isParamsConsultingUpdate != null && isParamsConsultingUpdate.update == 1){   
        setStartDate(isParamsConsultingUpdate.startDate);
        setEndDate(isParamsConsultingUpdate.endDate)
        setNumeroComprobante(isParamsConsultingUpdate.numeroComprobante)
        setUsuarioBusqueda(isParamsConsultingUpdate.usuarioBusqueda)
        setIsStartConsulting(true);
        //handleConsultar();
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

  const handleConsultar = async () => {
    // Validar fechas
    if (startDate || endDate) {//Si hay seleccionado una fecha
      if (!startDate || !endDate) {
        alert('Por favor seleccione un rango de fechas válido.');
        return;
      }
    }

    if (!startDate && !endDate && !numeroComprobante && !usuarioBusqueda) {
      alert('Por favor seleccione un método de búsqueda.');
      return;
    }
    

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
        screamConsultingComprobante:1
      }
      setIsParamsConsultingUpdate(paramsUpdate);
      
      const response = await axios.get(`${baseUrl}/api/comprobante/lista-por-filtro`, {
        params : {
          idCaho:idCaho,
          fechaInicio:fechaInicio,
          fechaFin:fechaFin,
          nroComprobante:numeroComprobante,
          nombreUsuario:usuarioBusqueda
        }
      });
      const data = response.data;

      if (!data) {
        show_alerta(response.data?.message || "Error al realizar consulta", "error");
      }
      console.log("data:------",data);
      let fechaFormateada = 'N/A';
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
        comprobanteDet: comprobante.comprobanteDet
      }));
      setComprobantes(comprobantesMapeados);
      
    } catch (err) {
      console.error('Error al consultar comprobantes:', err);
      setError('Error al cargar los datos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
      setIsConsulting(false);
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

  //Edición
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
        <h2 className="titulo">Consulta de Comprobantes</h2>
      </div>

      {/* Sección de Búsqueda/Filtros */}
      <section className="search-filters-section">
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
              <th></th> {/* Columna para el icono de ojo */}
            </tr>
          </thead>
          <tbody>
            {comprobantes.map((item, index) => (
              <tr key={index}>
                <td>{item.secuencia}</td>
                <td>{item.fechaValor}</td>
                <td>{item.usuario}</td>
                <td className="text-right">{item.debitos}</td>
                <td className="text-right">{item.creditos}</td>
                <td>{item.comprobante}</td>
                <td className="eye-icon-cell">
                  <span className="eye-icon"  onClick={() => handleOpenDetail(item)}>👁️</span>
                </td>
              </tr>
            ))}
            {/* Filas vacías para mantener la altura y el diseño si hay pocos datos */}
            {Array.from({ length: Math.max(0, 10 - comprobantes.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
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

export default ConsultaComprobante;