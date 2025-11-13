import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import Swal from 'sweetalert2';
import { show_alerta } from '../functions';
import '../assets/css/reporte.css';  
import Cookies from 'universal-cookie';
import config from '../config';
import axios from 'axios';

const baseUrl = config.API_BASE_URL;
const cookies = new Cookies();

// Objeto MesCierre
const listaMesCierre = [
  { idMesCierre: 12, descripcion: 'Histórico' },
  { idMesCierre: 13, descripcion: 'Cierre Anual' },
];

const LibroMayor = () => {
  const [libroMayor, setLibroMayor] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [isShowHistorico, setIsShowHistorico] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [periodo, setPeriodo] = useState('0');
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  const [nombreCaho, setNombreCaho] = useState(cookies.get('nombreCaho'));
  const [isConsulting, setIsConsulting] = useState(false);
  const [sectorCaho, seSectorCaho] = useState(cookies.get('sectorCaho'));
  const [codigoCaho, setCodigoCaho] = useState(cookies.get('codigoCaho'));
  const [mesCierre, setMesCierre] = useState(12);

  // Función para agrupar los datos por cuenta
  const groupByCuenta = (data) => {
    return data.reduce((acc, item) => {
      const key = item.cuenta;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  };

  const convertToISO = (date) => {
    if (!date) return '';
    
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    if (typeof date === 'string' && date.includes('/')) {
      const [day, month, year] = date.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return date;
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
      show_alerta('Por favor seleccione una fecha.', "error");
      return;
    }

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
    console.log("periodo",periodo)
    const fechaB = convertToISO(fecha);
   
    setLoading(true);
    setIsConsulting(true);

    try {
      const response = await fetch(
        baseUrl + `/api/cajas-ahorro/libro-mayor?idCaho=${idCaho}&fecha=${fechaB}&periodo=${periodo}`
      );
      const result = await response.json();

      console.log('Datos del libro mayor:', result.data);
      setLibroMayor(result.data);
      setGroupedData(groupByCuenta(result.data));
    } catch (err) {
      console.error('Error al consultar libro mayor:', err);
      setError('Error al cargar los datos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
      setIsConsulting(false);
    }
  };

  // Formatear números a 2 decimales
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return parseFloat(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleFechaChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Formato DD/MM/YYYY
    if (value.length > 8) return;
    
    if (value.length >= 2) {
        const day = value.substring(0, 2);
        const month = value.substring(2, 4);
        const year = value.substring(4, 8);
        value = `${day}${month ? `/${month}` : ''}${year ? `/${year}` : ''}`;
    }
    
    // Validación de día (01-31) y mes (01-12)
    if (value.length >= 5) {
        const day = parseInt(value.substring(0, 2));
        const month = parseInt(value.substring(3, 5));
        if (day < 1 || day > 31) {
            show_alerta("El día debe estar entre 01 y 31", "error");
            return;
        }
        if (month < 1 || month > 12) {
            show_alerta("El mes debe estar entre 01 y 12", "error");
            return;
        }
    }
    
    setFecha(value);
  };

  const handlePeriodoChange = (e) => {
    setPeriodo(e.target.value);
  };

  const splitTablesForPrint = (container) => {
    const tables = container.querySelectorAll('table');

    tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        let currentHeight = 0;
        let currentFragment = document.createElement('tbody');
        const maxHeight = 700;

        const originalTbody = table.querySelector('tbody');
        if (originalTbody) {
            originalTbody.remove();
        }

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
/*
  const handlePrint = () => {
    const element = document.getElementById('body-container');
    const clonedElement = element.cloneNode(true);
    
    clonedElement.style.width = '100%';
    clonedElement.style.padding = '0';
    clonedElement.style.boxShadow = 'none';
    
    splitTablesForPrint(clonedElement);
    
    const tables = clonedElement.querySelectorAll('table');
    tables.forEach(table => {
      table.style.width = '100%';
      table.style.minWidth = '0';
      table.style.fontSize = '6pt';
      table.style.setProperty('break-inside', 'auto', 'important');
    });
    
    const cuentaContainers = clonedElement.querySelectorAll('.cuenta-container');
    cuentaContainers.forEach(container => {
      container.style.setProperty('page-break-inside', 'avoid', 'important');
      container.style.setProperty('break-inside', 'avoid-page', 'important');
    });
    
    const cells = clonedElement.querySelectorAll('th, td');
    cells.forEach(cell => {
      cell.style.padding = '3px 4px';
      cell.style.whiteSpace = 'nowrap';
      cell.style.fontSize = '6pt';
      cell.style.setProperty('page-break-inside', 'avoid', 'important');
      cell.style.setProperty('break-inside', 'avoid', 'important');
    });
    
    const opt = {
      margin: [5, 5, 5, 5],
      filename: 'libro_mayor.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        ignoreElements: (element) => {
          return element.classList?.contains('no-print');
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4',
        orientation: 'landscape'
      }
    };
  
    html2pdf().set(opt).from(clonedElement).save();
  };
*/

const handlePrint = () => {
  const element = document.getElementById('body-container');
  const clonedElement = element.cloneNode(true);
  
  // Remover elementos no necesarios en PDF
  const noPrintElements = clonedElement.querySelectorAll('.no-print');
  noPrintElements.forEach(el => el.remove());
  
  // Aplicar estilos generales al contenedor
  clonedElement.style.width = '100%';
  clonedElement.style.padding = '0';
  clonedElement.style.margin = '0';
  clonedElement.style.boxShadow = 'none';
  clonedElement.style.backgroundColor = 'white';
  
  // Optimizar la tabla principal
  const mainTable = clonedElement.querySelector('table');
  if (mainTable) {
    mainTable.style.width = '100%';
    mainTable.style.minWidth = '0';
    mainTable.style.fontSize = '8pt';
    mainTable.style.tableLayout = 'auto';
    
    // Estilos para todas las celdas
    const allCells = mainTable.querySelectorAll('th, td');
    allCells.forEach(cell => {
      cell.style.padding = '4px 3px';
      cell.style.fontSize = '8pt';
      cell.style.lineHeight = '1.2';
      cell.style.wordWrap = 'break-word';
      cell.style.overflowWrap = 'break-word';
    });
  }

  const opt = {
    margin: [10, 10, 10, 10],
    filename: 'libro_mayor.pdf',
    image: { type: 'jpeg', quality: 0.8 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 1200
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4',
      orientation: 'landscape'
    }
  };

  html2pdf().set(opt).from(clonedElement).save();
};
  // Calcular totales por cuenta
  const calculateCuentaTotals = (items) => {
    const totales = items.reduce((totals, item) => {
      if (item.nroCbte !== null) { // Solo sumar movimientos, no encabezados
        totals.debitos += item.debitos || 0;
        totals.creditos += item.creditos || 0;
      }
      return totals;
    }, { debitos: 0, creditos: 0 });

    // Calcular saldo actual
    const saldoAnterior = items[0]?.saldoAnterior || 0;
    totales.saldoActual = saldoAnterior + totales.debitos - totales.creditos;

    return totales;
  };

  // Calcular totales globales
  const calculateGlobalTotals = () => {
    return Object.keys(groupedData).reduce((totals, cuenta) => {
      const cuentaData = groupedData[cuenta];
      const cuentaTotals = calculateCuentaTotals(cuentaData);
      
      totals.debitos += cuentaTotals.debitos;
      totals.creditos += cuentaTotals.creditos;
      totals.saldoActual += cuentaTotals.saldoActual;
      
      return totals;
    }, { debitos: 0, creditos: 0, saldoActual: 0 });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <span style={{ marginLeft: '15px', fontSize: '18px' }}>Cargando libro mayor...</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '5px',
        margin: '20px',
        textAlign: 'center'
      }}>
        <h3>Error al cargar los datos</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '10px',
            padding: '8px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const globalTotals = calculateGlobalTotals();

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>

      {/* Botón para imprimir PDF */}
      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <button className="no-print"
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
            <h1 style={{ margin: '0', fontSize: '28px' }}>Libro Mayor</h1>
            <p style={{ margin: '5px 0 0', opacity: '0.8' }}>Registros contables agrupados por cuenta</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><strong>Caja:</strong> {nombreCaho}</div>
            <div><strong>Sector:</strong> {sectorCaho == 0 ? 'Público' : 'Privado'}</div>
            <div><strong>Número de Registro:</strong> {codigoCaho}</div>
            {fecha ?
                <div className="print"><strong>Fecha Reporte:</strong> {fecha} </div>
                :
                ''
            }            
            
            {/* Filtros 
            <div className="filtro-fecha no-print" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div><strong>Fecha corte:</strong></div>
                  <div className="form-group">
                      <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={fecha}
                      onChange={handleFechaChange}
                      onBlur={(e) => {
                          if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(e.target.value)) {
                          show_alerta("Formato inválido. Use DD/MM/YYYY", "error");
                          }
                      }}
                      style={{ width: '120px' }}
                      />
                  </div>
                </div>

                                
                <button 
                    className="consultar-button"
                    onClick={handleConsultar}
                    disabled={isConsulting}
                    style={{ 
                    height: '69px',
                    marginBottom: '0'
                    }}>
                    {isConsulting ? (
                        <div className="spinner-container">
                        <div className="spinner"></div>
                        Consultando...
                        </div>
                    ) : (
                        'Consultar'
                    )}
                </button>
            </div>*/}

            {/* Fecha */}
            <div className="filtro-fecha no-print" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px',marginTop: '15px'  }}>
                <div><strong>Consultar fecha:</strong> </div>
                <div className="form-group ultimo-mes-cerrado" style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={fecha}
                      onChange={handleFechaChange}
                      onBlur={(e) => {
                          if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(e.target.value)) {
                          show_alerta("Formato inválido. Use DD/MM/YYYY", "error");
                          }
                      }}
                      style={{ width: '120px' }}
                    />
                </div>
                {isShowHistorico ? 
                  <>
                    <div><strong>Mes Cierre:</strong> </div>
                    <div className="form-group col-md-2" style={{ flex: 1 }}>
                        <select
                          id="mesCierre"
                          value={mesCierre}
                          style={{
                            padding: '12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            fontSize: '14px'}}
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
                  </>
                  :
                  ''
                }
                <button 
                    className="consultar-button"
                    onClick={handleConsultar}
                    disabled={isConsulting}
                    style={{ 
                    height: '43px',  // Ajusta para coincidir con la altura del input
                    //marginBottom: '16px' // Alinea verticalmente con el input
                    }}>
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
          </div>
        </div>
        
        {/* Contenido */}
        <div style={{ padding: '20px' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            minWidth: '1000px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#002a26' }}>
                <th style={{ color:'#FFF', padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '10%' }}>Cuenta</th>
                <th style={{ color:'#FFF', padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '15%' }}>Descripción</th>
                <th style={{ color:'#FFF', padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '15%' }}>Auxiliar</th>
                <th style={{ color:'#FFF', padding: '12px 8px', textAlign: 'right', borderBottom: '1px solid #ddd', width: '10%' }}>Saldo Anterior</th>
                <th style={{ color:'#FFF', padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '12%' }}>No Cbte.</th>
                <th style={{ color:'#FFF', padding: '12px 8px', textAlign: 'left', borderBottom: '1px solid #ddd', width: '10%' }}>Fecha Cbte</th>
                <th style={{ color:'#FFF', padding: '12px 8px', textAlign: 'right', borderBottom: '1px solid #ddd', width: '8%' }}>Débitos</th>
                <th style={{ color:'#FFF', padding: '12px 8px', textAlign: 'right', borderBottom: '1px solid #ddd', width: '8%' }}>Créditos</th>
                <th style={{ color:'#FFF', padding: '12px 8px', textAlign: 'right', borderBottom: '1px solid #ddd', width: '12%' }}>Saldo Actual</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedData).map((cuenta) => {
                const cuentaData = groupedData[cuenta];
                const cuentaTotals = calculateCuentaTotals(cuentaData);
                const primeraFila = cuentaData[0];
                
                return (
                  <React.Fragment key={cuenta}>
                    {/* Encabezado de cuenta */}
                    <tr className="cuenta-container" style={{ backgroundColor: '#d1e7dd' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{primeraFila.cuenta}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{primeraFila.descripcionCuenta}</td>
                      <td style={{ padding: '8px' }}>-</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatNumber(primeraFila.saldoAnterior)}
                      </td>
                      <td style={{ padding: '8px' }}></td>
                      <td style={{ padding: '8px' }}></td>
                      <td style={{ padding: '8px', textAlign: 'right' }}></td>
                      <td style={{ padding: '8px', textAlign: 'right' }}></td>
                      <td style={{ padding: '8px', textAlign: 'right' }}></td>
                    </tr>
                    
                    {/* Movimientos de la cuenta */}
                    {cuentaData.map((item, index) => (
                      item.nroCbte && (
                        <tr key={index} style={{ 
                          borderBottom: '1px solid #eee',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                        }}>
                          <td style={{ padding: '8px' }}></td>
                          <td style={{ padding: '8px' }}></td>
                          <td style={{ padding: '8px' }}>
                            {item.nombreAuxiliar || '-'}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right' }}></td>
                          <td style={{ padding: '8px' }}>{item.nroCbte}</td>
                          <td style={{ padding: '8px' }}>{item.fechaCte}</td>
                          <td style={{ padding: '8px', textAlign: 'right', color: item.debitos > 0 ? '#27ae60' : '#7f8c8d' }}>
                            {item.debitos > 0 ? formatNumber(item.debitos) : '-'}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', color: item.creditos > 0 ? '#e74c3c' : '#7f8c8d' }}>
                            {item.creditos > 0 ? formatNumber(item.creditos) : '-'}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right' }}></td>
                        </tr>
                      )
                    ))}
                    
                    {/* Total de la cuenta */}
                    <tr style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                      <td style={{ padding: '8px' }}></td>
                      <td style={{ padding: '8px' }}></td>
                      <td style={{ padding: '8px' }}>Total Cuenta:</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        {formatNumber(primeraFila.saldoAnterior)}
                      </td>
                      <td style={{ padding: '8px' }}></td>
                      <td style={{ padding: '8px' }}></td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#27ae60' }}>
                        {formatNumber(cuentaTotals.debitos)}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#e74c3c' }}>
                        {formatNumber(cuentaTotals.creditos)}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', 
                        color: cuentaTotals.saldoActual < 0 ? '#e74c3c' : '#27ae60' }}>
                        {formatNumber(cuentaTotals.saldoActual)}
                      </td>
                    </tr>
                    
                    {/* Espacio entre cuentas */}
                    <tr>
                      <td colSpan="9" style={{ padding: '15px', borderBottom: '2px solid #dee2e6' }}></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
            
            {/* Totales globales */}
            <tfoot style={{ backgroundColor: '#f1f8ff', fontWeight: 'bold' }}>
              <tr>
                <td colSpan="6" style={{ padding: '12px 8px', textAlign: 'right' }}>Total Libro Mayor:</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#27ae60' }}>
                  {formatNumber(globalTotals.debitos)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#e74c3c' }}>
                  {formatNumber(globalTotals.creditos)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', 
                  color: globalTotals.saldoActual < 0 ? '#e74c3c' : '#27ae60' }}>
                  {formatNumber(globalTotals.saldoActual)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Pie de página */}
      <div style={{ 
        textAlign: 'center', 
        color: '#7f8c8d', 
        fontSize: '0.9rem',
        marginTop: '20px'
      }}>
        Sistema Contable - Libro Mayor © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default LibroMayor;