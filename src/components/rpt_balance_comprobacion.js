import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/css/reporte.css';
import { show_alerta } from '../functions';
import axios from 'axios';
import config from '../config';
import Cookies from 'universal-cookie';
import { registerLocale } from "react-datepicker";
import html2pdf from 'html2pdf.js';

registerLocale('es', es);
// Objeto estatus
const estatus = [
  { idEstatus: 0, descripcion: 'No' },
  { idEstatus: 1, descripcion: 'Si' },
];

// Objeto MesCierre
const listaMesCierre = [
  { idMesCierre: 12, descripcion: 'Histórico' },
  { idMesCierre: 13, descripcion: 'Cierre Anual' },
];

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

const BalanceComprobacion = ({ setCurrentComponent }) => {
  const baseUrl = config.API_BASE_URL;
  const cookies = new Cookies();
  
  // Estados para los campos de búsqueda
  const [fecha, setFecha] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [isShowHistorico, setIsShowHistorico] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [vData, setVData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [estatusBusqueda, setEstatusBusqueda] = useState(0);
  const [mesCierre, setMesCierre] = useState(12);
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  const [nombreCaho, setNombreCaho] = useState(cookies.get('nombreCaho'));
  const [sectorCaho, seSectorCaho] = useState(cookies.get('sectorCaho'));
  const [codigoCaho, setCodigoCaho] = useState(cookies.get('codigoCaho'));
  
  const handleChangeComponent = (currents) => {
    setCurrentComponent(currents);
  };
  useEffect(() => {
    // Carga inicial de datos
    //const fechaActual = new Date(); 
    //setFecha(fechaActual);
  }, []);


  function getMonth(fecha) {
    // Convertir a objeto Date si es string
    const dateObj =  new Date(fecha);
    console.log("dateObj",dateObj); 
    // Nombres de los meses
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", 
      "Mayo", "Junio", "Julio", "Agosto",
      "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    // Obtener el número del mes (0-11)
    const numeroMes = dateObj.getMonth();
    console.log("numeroMes",numeroMes);
    // Devolver el nombre del mes
    //return meses[numeroMes];

    return numeroMes + 1;
  }

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

   //Valida fecha valor
   const validarMesCierre = async () => {
    if (!fecha) {
      show_alerta("Por favor, ingrese una fecha valor", "warning");
      return;
    }
    console.log("fechaaa",fecha)
    try {
      var fecha1 = convertToISO(fecha);
      const response = await axios.get(`${baseUrl}/api/cajas-ahorro/val-mes-cierre`, {
        params: {
          idCaho:idCaho, 
          fecha:fecha1
        }
      });

      const data = response.data;
      if (data.status === "success" && data.data) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const handleConsultar = async () => {
    if (!fecha) {
      show_alerta("Por favor seleccione una fecha.", "error");
      return;
    }
    setIsConsulting(true);
    var periodo = 0;
    var valMesCierre = await validarMesCierre();
    console.log("valMesCierre",valMesCierre)
    if (valMesCierre && !isShowHistorico){
      setIsShowHistorico(true);
      setIsConsulting(false);
      show_alerta("Por favor, seleccione un mes de cierre", "warning");
      return;
    }
    
    if(!valMesCierre){
      setIsShowHistorico(false);
    }

    if(valMesCierre && isShowHistorico){
      periodo = mesCierre;
    }

    var fecha1 = convertToISO(fecha);
    console.log(fecha1)
    var tipo = estatusBusqueda == 1 ? true : false;

    try {
      const response = await axios.get(`${baseUrl}/api/cajas-ahorro/balance-comprobacion`, {
        params: {
          idCaho: idCaho,
          fecha: fecha1,
          periodo: periodo,
          tipo: tipo,
        }
      });
      console.log(response)
      if (response.data.data && response.data.data.length > 0) {
        setVData(response.data.data);
      } else {
        setVData([]);
        show_alerta("No se encontraron resultados", "info");
      }
    } catch (err) {
      console.error('Error al consultar estado res:', err);
      setError('Error al cargar los datos. Por favor intente nuevamente.');
      show_alerta("Error al consultar datos de balance de comprobación", "error");
    } finally {
      setLoading(false);
      setIsConsulting(false);
    }
  };

  const handleRegresar = () => {
    handleChangeComponent('informe');
  };

  const splitTablesForPrint = (container) => {
    const tables = container.querySelectorAll('table');

    tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        let currentHeight = 0;
        let currentFragment = document.createElement('tbody');
        const maxHeight = 700; // Altura máxima estimada por página

        const originalTbody = table.querySelector('tbody');
        originalTbody.remove();

        rows.forEach((row) => {
            const rowHeight = row.offsetHeight;

            if (currentHeight + rowHeight > maxHeight && currentFragment.children.length > 0) {
                table.appendChild(currentFragment);
                const pageBreak = document.createElement('div');
                pageBreak.style.pageBreakBefore = 'always';
                table.parentNode.insertBefore(pageBreak, table.nextSibling);

                currentFragment = document.createElement('tbody');
                currentHeight = 0;
            }

            currentFragment.appendChild(row);
            currentHeight += rowHeight;
        });

        if (currentFragment.children.length > 0) {
            table.appendChild(currentFragment);
        }
    });
  };
  
  const handlePrint = () => {
    const element = document.getElementById('body-container');
    const clonedElement = element.cloneNode(true);
    
    // Aplicar estilos específicos para PDF
    clonedElement.style.width = '100%';
    clonedElement.style.padding = '0';
    clonedElement.style.boxShadow = 'none';
    
    splitTablesForPrint(clonedElement);
    // Modificar estilos de la tabla para PDF
    const tables = clonedElement.querySelectorAll('table');
    tables.forEach(table => {
      table.style.width = '100%';
      table.style.minWidth = '0';
      table.style.fontSize = '7pt'; // Tamaño reducido
      table.style.setProperty('break-inside', 'auto', 'important');
    });
    
    // Modificar contenedores de comprobantes
    const comprobantes = clonedElement.querySelectorAll('.comprobante-container');
    comprobantes.forEach(container => {
      container.style.setProperty('page-break-inside', 'avoid', 'important');
      container.style.setProperty('break-inside', 'avoid-page', 'important');
    });
    
    // Modificar celdas
    const cells = clonedElement.querySelectorAll('th, td');
    cells.forEach(cell => {
      cell.style.padding = '3px 4px'; // Padding reducido
      cell.style.whiteSpace = 'nowrap';
      cell.style.fontSize = '7pt'; // Tamaño reducido
      cell.style.setProperty('page-break-inside', 'avoid', 'important');
      cell.style.setProperty('break-inside', 'avoid', 'important');
    });
    
    // Configuración optimizada de PDF
    const opt = {
      margin: [5, 5, 5, 5], // Márgenes reducidos
      filename: 'libro_diario.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2,  // Escala reducida
        useCORS: true,
        //width: 1123,
        //windowWidth: 1123,
        ignoreElements: (element) => {
          return element.classList?.contains('no-print');
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        //orientation: 'landscape'
      }
    };
  
    // Crear PDF
    html2pdf().set(opt).from(clonedElement).save();
  };

  return (
    <div className="reporte-estado-resultado-container" style={{ 
      fontFamily: 'Arial, sans-serif', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      {/*<div className="header">
        <button className="regresar-button" onClick={handleRegresar}>
          <span className="icon">←</span> Regresar
        </button>
        <h2 className="titulo">Estado de Resultado</h2>
        </div>*/}

      {/* Botón para imprimir PDF */}
      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <button  className="no-print"
          onClick={handlePrint}
          style={{
            padding: '8px 15px',
            backgroundColor: '#002A26',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
            <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
          </svg>
          Exportar a PDF
        </button>
      </div>

      <div id="body-container" style={{
           backgroundColor: 'white', 
           boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
           overflow: 'hidden',
           marginBottom: '20px',
           margin: '0 auto',
           padding: '20px' 
        }}>
        {/* Encabezado */}
          <div style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '0.5px solid #e9ecef'
          }}>
            <div>
              <h1 style={{ margin: '0', fontSize: '28px' }}>Balance de Comprobación</h1>
              <p style={{ margin: '5px 0 0', opacity: '0.8' }}> (PRELIMINAR)</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div><strong>Caja:</strong> {nombreCaho}</div>
              <div><strong>Sector:</strong> {sectorCaho == 0 ? 'Público' : 'Privado'}</div>
              <div><strong>Número de Registro:</strong> {codigoCaho}</div>
              {fecha ?
                  <div className="print"><strong>Fecha Reporte:</strong> {convertToISO2(fecha)} </div>
                  :
                  ''
              }
              
            </div>
          </div>

        {/* Sección de Búsqueda/Filtros */}
        <section className="search-filters-section no-print">
          <div style={{display:'flex',gap:'20px'}}>
            <div className="form-group col-md-4">
              <label htmlFor="fechaValor" style={{ fontWeight: "600",color: "#000"}}>Fecha </label>
              <div className="input-with-icon">
                <input
                  type="date"
                  id="fechaValor"
                  placeholder="DD/MM/YYYY"
                  //value={fechaValor}
                  //value={fecha.split('/').reverse().join('-')}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group col-md-2">
              <label htmlFor="estatusBusqueda">¿Imprirmir cuentas en 0?</label>
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
            {isShowHistorico ? 
              <div className="form-group col-md-2">
                <label htmlFor="mesCierre">Mes Cierre</label>
                <div className='input-with-icon'>
                  <select
                    id="mesCierre"
                    value={mesCierre}
                    onChange={(e) => setMesCierre(e.target.value)}
                    className="custom-select"
                  >
                    {listaMesCierre.map(item => (
                      <option key={item.idMesCierre} value={item.idMesCierre}>
                        {item.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              :
              ''
            }
            <button 
              className="consultar-button" 
              onClick={handleConsultar}
              disabled={isConsulting}
              style={{height:'40px',marginTop: '30px'}}
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
          </div>
        </section>
        {/* Sección de la Tabla */}
        <section className="table-section">
          <div className="table-container">
            <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      minWidth: '800px',
                      marginTop: '15px'
                    }}>
              <thead>
              <tr style={{ backgroundColor: '#20373e',color:'#FFF' }}>
                  <th>Cuenta</th>
                  <th>Descripción</th>
                  <th>Auxiliar</th>
                  <th style={{width:"170px"}} className="text-right">Saldo Anterior</th>
                  <th style={{width:"170px"}} className="text-right">Débitos mes </th>
                  <th style={{width:"170px"}} className="text-right">Crédito mes </th>
                  <th style={{width:"170px"}} className="text-right">Saldo Actual </th>
                </tr>
              </thead>
              <tbody>
                {vData.length > 0 ? (
                  vData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.cuenta}</td>
                      <td>{item.descripcion.replace(/~/g, '\u00A0')}</td>
                      <td>{item.cod_auxi} {item.desc_auxi}</td>
                      <td className="text-right">{formatCurrency(item.saldo_anterior)}</td>
                      <td className="text-right">{formatCurrency(item.debitos_mes)}</td>
                      <td className="text-right">{formatCurrency(item.creditos_mes)}</td>
                      <td className="text-right">{formatCurrency(item.saldo_actual)}</td>
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
                {vData.length > 0 && vData.length < 5 && 
                  Array.from({ length: 5 - vData.length }).map((_, i) => (
                    <tr key={`empty-${i}`} className="empty-row">
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
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

        {/* Pie de Tabla / Paginación 
        <footer className="table-footer">
          <div className="pagination-info">
            Mostrando {vData.length} registros
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
        </footer>*/}
      </div>

    </div>
  );
};

export default BalanceComprobacion;