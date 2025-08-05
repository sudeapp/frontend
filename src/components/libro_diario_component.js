import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import Swal from 'sweetalert2';
import { show_alerta } from '../functions';
import '../assets/css/libroDiario.css'; 
import Cookies from 'universal-cookie';
import config from '../config';

const baseUrl = config.API_BASE_URL;
const cookies = new Cookies();

const LibroDiario = () => {
  const [libroDiario, setLibroDiario] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  const [nombreCaho, setNombreCaho] = useState(cookies.get('nombreCaho'));
  const [isConsulting, setIsConsulting] = useState(false);
  // Datos de ejemplo (simulando la respuesta de la API)
  useEffect(() => {
    setLoading(true);
    try {
      const fetchData = async () => {
        const response = await fetch(
            baseUrl + `/api/cajas-ahorro/libro-diario?idCaho=${idCaho}&fecha=2025-06-30`
        );
        const result = await response.json();

        console.log(result.data)
        setLibroDiario(result.data);
      setGroupedData(groupByComprobante(result.data));
      setLoading(false);
      };
      fetchData();
    } catch (err) {
      setError("Error al cargar los datos: " + err.message);
      setLoading(false);
    }
  }, []);

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

  const handleConsultar = async () => {
    
    if (!fecha) {
      show_alerta('Por favor seleccione una fecha.', "error");
      return;
    }

    var fechaB = convertToISO(`01/${fecha}`);
   
    setLoading(true);
    setIsConsulting(true);

    try {
        const fetchData = async () => {
            const response = await fetch(
                baseUrl + `/api/cajas-ahorro/libro-diario?idCaho=${idCaho}&fecha=${fechaB}`
            );
            const result = await response.json();

            console.log(result.data)
            setLibroDiario(result.data);
            setGroupedData(groupByComprobante(result.data));
            setLoading(false);
        };
        fetchData();
    } catch (err) {
      console.error('Error al consultar comprobantes:', err);
      setError('Error al cargar los datos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
      setIsConsulting(false);
    }
  };


  const sampleData = {
    data: [
      {
        idCaja: 20,
        nroCbte: 202506,
        fechaCte: "2025-06-01",
        periodo: null,
        idPlanCatalogo: 2536,
        cuenta: "312.01.01.00",
        descripcionCuenta: "Aportes Ordinarios Asociados",
        codigoAuxiliar: null,
        nombreAuxiliar: null,
        descripcion: "Aporte Inicial",
        debitos: 0.0,
        creditos: 3.5
      },
      {
        idCaja: 20,
        nroCbte: 202507,
        fechaCte: "2025-06-02",
        periodo: null,
        idPlanCatalogo: 2537,
        cuenta: "312.01.02.00",
        descripcionCuenta: "Aportes Extraordinarios",
        codigoAuxiliar: null,
        nombreAuxiliar: null,
        descripcion: "Aporte Especial",
        debitos: 0.0,
        creditos: 5.0
      },
      {
        idCaja: 20,
        nroCbte: 202506,
        fechaCte: "2025-06-01",
        periodo: null,
        idPlanCatalogo: 2538,
        cuenta: "312.01.03.00",
        descripcionCuenta: "Intereses Acumulados",
        codigoAuxiliar: null,
        nombreAuxiliar: null,
        descripcion: "Intereses",
        debitos: 0.0,
        creditos: 2.0
      },
      {
        idCaja: 20,
        nroCbte: 202508,
        fechaCte: "2025-06-03",
        periodo: null,
        idPlanCatalogo: 2539,
        cuenta: "312.01.04.00",
        descripcionCuenta: "Comisiones",
        codigoAuxiliar: null,
        nombreAuxiliar: null,
        descripcion: "Comisión Mensual",
        debitos: 1.5,
        creditos: 0.0
      },
      {
        idCaja: 20,
        nroCbte: 202507,
        fechaCte: "2025-06-02",
        periodo: null,
        idPlanCatalogo: 2540,
        cuenta: "312.01.05.00",
        descripcionCuenta: "Ajustes",
        codigoAuxiliar: null,
        nombreAuxiliar: null,
        descripcion: "Ajuste por Redondeo",
        debitos: 0.2,
        creditos: 0.0
      }
    ],
    status: "success",
    message: "validación"
  };

  // Función para agrupar los datos por nroCbte
  const groupByComprobante = (data) => {
    return data.reduce((acc, item) => {
      const key = item.nroCbte;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  };

  // Calcular totales para cada comprobante
  const calculateTotals = (items) => {
    return items.reduce((totals, item) => {
      totals.debitos += item.debitos;
      totals.creditos += item.creditos;
      return totals;
    }, { debitos: 0, creditos: 0 });
  };

  // Formatear números a 2 decimales
  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleFechaChange = (e) => {
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
    
    setFecha(value);
};
/*
  const splitTablesForPrint = (container) => {
    const tables = container.querySelectorAll('table');
    
    tables.forEach(table => {
      const rows = table.querySelectorAll('tr');
      let currentHeight = 0;
      let currentFragment = document.createElement('tbody');
      const maxHeight = 700; // Altura máxima estimada por página
      
      table.querySelector('tbody').remove();
      
      rows.forEach((row, index) => {
        const rowHeight = row.offsetHeight;
        
        if (currentHeight + rowHeight > maxHeight && currentFragment.children.length > 0) {
          table.appendChild(currentFragment);
          // Insertar salto de página
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
  };*/

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


  /*
  const handlePrint = () => {
    // Clonar el elemento para modificar estilos solo para PDF
    const element = document.getElementById('body-container');
    const clonedElement = element.cloneNode(true);
    
    // Aplicar estilos específicos para PDF
    clonedElement.style.width = '100%';
    clonedElement.style.padding = '0';
    clonedElement.style.boxShadow = 'none';
    //clonedElement.style.marginLeft = '20px';
    // Modificar estilos de la tabla para PDF
    const tables = clonedElement.querySelectorAll('table');
    tables.forEach(table => {
      //table.style.marginLeft = '30px';
      table.style.width = '100%';
      table.style.minWidth = '0';
      table.style.fontSize = '9pt';
    });
    
    // Modificar celdas
    const cells = clonedElement.querySelectorAll('th, td');
    cells.forEach(cell => {
      cell.style.padding = '5px 8px';
      cell.style.whiteSpace = 'nowrap';
    });
    
    // Modificar encabezados
    const headers = clonedElement.querySelectorAll('th');
    headers.forEach(header => {
      header.style.fontSize = '10pt';
    });

    // Configuración de PDF
    const opt = {
      margin: [10, 10, 10, 1.5],
      filename: 'libro_diario.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        width: 1123,  // Ancho A4 en píxeles (210mm * 96dpi/25.4)
        windowWidth: 1200
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape'  // Cambiar a horizontal
      }
    };

    // Crear PDF
    html2pdf().set(opt).from(clonedElement).save();
  };*/

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
        <span style={{ marginLeft: '15px', fontSize: '18px' }}>Cargando libro diario...</span>
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

  // Calcular totales globales
  const globalTotals = libroDiario.reduce((totals, item) => {
    totals.debitos += item.debitos;
    totals.creditos += item.creditos;
    return totals;
  }, { debitos: 0, creditos: 0 });

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>

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
            <h1 style={{ margin: '0', fontSize: '28px' }}>Libro Diario</h1>
            <p style={{ margin: '5px 0 0', opacity: '0.8' }}>Registros contables agrupados por comprobante</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><strong>Caja:</strong> {nombreCaho}</div>
            {fecha ?
                <div className="print"><strong>Fecha seleccionada:</strong> {fecha} </div>
                :
                ''
            }
            
            {/* Fecha */}
            <div className="filtro-fecha no-print" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                <div><strong>Consultar fecha:</strong> </div>
                <div className="form-group ultimo-mes-cerrado" style={{ flex: 1 }}>
                    <input
                    type="text"
                    id="ultimo-mes-cerrado"
                    placeholder="MM/YYYY"
                    value={fecha}
                    onChange={(e) => handleFechaChange(e)}
                    onBlur={(e) => {
                        if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(e.target.value)) {
                        show_alerta("Formato inválido. Use MM/YYYY", "error");
                        }
                    }}
                    />
                </div>
                
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
          {Object.keys(groupedData).map((nroCbte) => {
            const comprobante = groupedData[nroCbte];
            const comprobanteTotals = calculateTotals(comprobante);
            const fecha = comprobante[0].fechaCte;
            
            return (
              <div key={nroCbte} 
                className="comprobante-container"  // Clase importante
                style={{ 
                    marginBottom: '30px', 
                    borderBottom: '0.5px solid #e0e0e0', 
                    overflow: 'hidden',
                    pageBreakInside: 'avoid',  // Propiedad CSS crucial
                    breakInside: 'avoid-page'  // Propiedad CSS moderna
                }}>
                {/* Encabezado del comprobante */}
                <div style={{ 
                  backgroundColor: '#002A26', 
                  color: 'white', 
                  padding: '12px 15px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong>Comprobante:</strong> {nroCbte}
                  </div>
                  <div>
                    <strong>Fecha:</strong> {fecha}
                  </div>
                </div>
                
                {/* Tabla de registros */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    minWidth: '800px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#d1e7dd' }}>
                        <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd',width:'10%' }}>Cuenta</th>
                        <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd',width:'20%' }}>Descripción Cuenta</th>
                        <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd',width:'30%' }}>Descripción</th>
                        <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd',width:'20%' }}>Auxiliar</th>
                        <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '1px solid #ddd',width:'10%' }}>Débitos</th>
                        <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '1px solid #ddd',width:'10%' }}>Créditos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comprobante.map((item, index) => (
                        <tr key={index} style={{ 
                          borderBottom: index === comprobante.length - 1 ? 'none' : '1px solid #eee',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                        }}>
                          <td style={{ padding: '10px 15px' }}>{item.cuenta}</td>
                          <td style={{ padding: '10px 15px' }}>{item.descripcionCuenta}</td>
                          <td style={{ padding: '10px 15px' }}>{item.descripcion}</td>
                          <td style={{ padding: '10px 15px' }}>
                            {item.codigoAuxiliar != null ? item.codigoAuxiliar : '-'}
                            {item.nombreAuxiliar != null ? item.nombreAuxiliar : '-'}
                          </td>
                          <td style={{ padding: '10px 15px', textAlign: 'right', color: item.debitos > 0 ? '#27ae60' : '#7f8c8d' }}>
                            {item.debitos > 0 ? formatNumber(item.debitos) : '-'}
                          </td>
                          <td style={{ padding: '10px 15px', textAlign: 'right', color: item.creditos > 0 ? '#e74c3c' : '#7f8c8d' }}>
                            {item.creditos > 0 ? formatNumber(item.creditos) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/*<tfoot style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                      <tr>
                        <td colSpan="3" style={{ padding: '10px 15px', textAlign: 'right' }}>Totales del Comprobante:</td>
                        <td style={{ padding: '10px 15px', textAlign: 'right', color: '#27ae60' }}>
                          {formatNumber(comprobanteTotals.debitos)}
                        </td>
                        <td style={{ padding: '10px 15px', textAlign: 'right', color: '#e74c3c' }}>
                          {formatNumber(comprobanteTotals.creditos)}
                        </td>
                      </tr>
                    </tfoot>*/}
                  </table>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Totales globales 
        <div style={{ 
          backgroundColor: '#f1f8ff', 
          padding: '15px 20px', 
          textAlign: 'center',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'center',
          gap: '30px'
        }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>Total Débitos:</span> 
            <span style={{ color: '#27ae60', marginLeft: '10px', fontWeight: 'bold', fontSize: '18px' }}>
              {formatNumber(globalTotals.debitos)}
            </span>
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>Total Créditos:</span> 
            <span style={{ color: '#e74c3c', marginLeft: '10px', fontWeight: 'bold', fontSize: '18px' }}>
              {formatNumber(globalTotals.creditos)}
            </span>
          </div>
        </div>*/}
      </div>
      
      {/* Pie de página */}
      <div style={{ 
        textAlign: 'center', 
        color: '#7f8c8d', 
        fontSize: '0.9rem',
        marginTop: '20px'
      }}>
        Sistema Contable - Libro Diario © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default LibroDiario;