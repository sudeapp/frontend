import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/css/vpc.css';
import { show_alerta } from '../functions';
import axios from 'axios';
import config from '../config';
import Cookies from 'universal-cookie';
import { registerLocale } from "react-datepicker";

registerLocale('es', es);

const ConsultaVpc = ({ setCurrentComponent }) => {
  const baseUrl = config.API_BASE_URL;
  const cookies = new Cookies();
  
  // Estados para los campos de búsqueda
  const [fechaRango, setFechaRango] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [vpcData, setVpcData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  
  const handleChangeComponent = (currents) => {
    setCurrentComponent(currents);
  };

  useEffect(() => {
    // Carga inicial de datos
    handleConsultar();
  }, []);

  // Manejador de cambio de rango de fechas
  /*const handleDateChange = (dates) => {
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
  };*/

  const handleConsultar = async () => {
    setLoading(true);
    setIsConsulting(true);
    setError(null);

    try {
      const response = await axios.get(`${baseUrl}/api/cajas-ahorro/vpc`, {
        params: {
          idCaho: idCaho,
        }
      });
      
      if (response.data && response.data.data.length > 0) {
        setVpcData(response.data.data);
      } else {
        setVpcData([]);
        show_alerta("No se encontraron resultados", "info");
      }
    } catch (err) {
      console.error('Error al consultar VPC:', err);
      setError('Error al cargar los datos. Por favor intente nuevamente.');
      show_alerta("Error al consultar datos de VPC", "error");
    } finally {
      setLoading(false);
      setIsConsulting(false);
    }
  };

  const handleRegresar = () => {
    handleChangeComponent('moduloContabilidad');
  };

  const handleLimpiar = () => {
    setStartDate(null);
    setEndDate(null);
    setBusqueda('');
    setFechaRango('');
    handleConsultar();
  };

  return (
    <div className="consulta-comprobantes-container">
      <div className="header">
        <button className="regresar-button" onClick={handleRegresar}>
          <span className="icon">←</span> Regresar
        </button>
        <h2 className="titulo">Plan Contable</h2>
      </div>

      {/* Sección de la Tabla */}
      <section className="table-section">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th width='120'>Formato</th>
                {/*<th>Cuenta</th>*/}
                <th width='50'>Nivel</th>
                <th width='50'>Tipo</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {vpcData.length > 0 ? (
                vpcData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.formato}</td>
                    {/*<td>{item.cuenta}</td>*/}
                    <td>{item.nivel}</td>
                    <td align='center'>{item.tipo}</td>
                    <td>{item.descripcion.replace(/~/g, '\u00A0')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    {loading ? 'Cargando datos...' : 'No se encontraron registros'}
                  </td>
                </tr>
              )}
              
              {/* Filas vacías para mantener la altura si hay pocos datos */}
              {vpcData.length > 0 && vpcData.length < 10 && 
                Array.from({ length: 10 - vpcData.length }).map((_, i) => (
                  <tr key={`empty-${i}`} className="empty-row">
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </section>

      {/* Pie de Tabla / Paginación */}
      <footer className="table-footer">
        <div className="pagination-info">
          Mostrando {vpcData.length} registros
        </div>
        <div className="pagination">
          <button className="pagination-button" disabled>
            &lt;
          </button>
          <span>1/1</span>
          <button className="pagination-button" disabled>
            &gt;
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ConsultaVpc;