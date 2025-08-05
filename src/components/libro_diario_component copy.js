// LibroDiario.js
import React, { useState, useEffect } from 'react';

const LibroDiario = () => {
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ID de caja y fecha fijos según el ejemplo
  const idCaja = 20;
  const fecha = "2025-06-30";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/cajas-ahorro/libro-diario?idCaho=${idCaja}&fecha=${fecha}`
        );
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.status === "success") {
          setData(result.data);
          
          // Agrupar datos por nroCbte
          const grouped = result.data.reduce((acc, item) => {
            const key = item.nroCbte;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(item);
            return acc;
          }, {});
          
          setGroupedData(grouped);
        } else {
          throw new Error(result.message || "Error en la respuesta del servidor");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idCaja, fecha]);

  // Calcular totales para cada grupo
  const calculateTotals = (items) => {
    return items.reduce(
      (totals, item) => {
        totals.debitos += item.debitos;
        totals.creditos += item.creditos;
        return totals;
      },
      { debitos: 0, creditos: 0 }
    );
  };

  // Formatear números a 2 decimales
  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span style={{ marginLeft: '10px', fontSize: '18px' }}>Cargando libro diario...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert" style={{ margin: '20px' }}>
        <h4 className="alert-heading">Error al cargar datos</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Por favor verifique la conexión o intente nuevamente más tarde.</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="alert alert-info" role="alert" style={{ margin: '20px' }}>
        No se encontraron registros para la fecha seleccionada.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '10px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>Libro Diario</h2>
          <div>
            <span style={{ marginRight: '20px' }}>Caja: {idCaja}</span>
            <span>Fecha: {fecha}</span>
          </div>
        </div>
        
        <div style={{ padding: '20px' }}>
          {Object.entries(groupedData).map(([nroCbte, items]) => {
            const totals = calculateTotals(items);
            
            return (
              <div key={nroCbte} style={{ 
                marginBottom: '30px', 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  backgroundColor: '#3498db', 
                  color: 'white', 
                  padding: '10px 15px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong>Comprobante:</strong> {nroCbte}
                  </div>
                  <div>
                    <strong>Fecha:</strong> {items[0].fechaCte}
                  </div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ marginBottom: '0' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f8ff' }}>
                        <th>Cuenta</th>
                        <th>Descripción Cuenta</th>
                        <th>Descripción</th>
                        <th className="text-end">Débitos</th>
                        <th className="text-end">Créditos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: index === items.length - 1 ? 'none' : '1px solid #e0e0e0' }}>
                          <td>{item.cuenta}</td>
                          <td>{item.descripcionCuenta}</td>
                          <td>{item.descripcion}</td>
                          <td className="text-end" style={{ color: item.debitos > 0 ? '#27ae60' : '#7f8c8d' }}>
                            {item.debitos > 0 ? formatNumber(item.debitos) : '-'}
                          </td>
                          <td className="text-end" style={{ color: item.creditos > 0 ? '#e74c3c' : '#7f8c8d' }}>
                            {item.creditos > 0 ? formatNumber(item.creditos) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                      <tr>
                        <td colSpan="3" className="text-end">Totales:</td>
                        <td className="text-end" style={{ color: '#27ae60' }}>
                          {formatNumber(totals.debitos)}
                        </td>
                        <td className="text-end" style={{ color: '#e74c3c' }}>
                          {formatNumber(totals.creditos)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
        
        <div style={{ 
          backgroundColor: '#f1f8ff', 
          padding: '15px 20px', 
          textAlign: 'center',
          borderTop: '1px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <div>
              <span style={{ fontWeight: 'bold' }}>Total Débitos:</span> 
              <span style={{ color: '#27ae60', marginLeft: '10px', fontWeight: 'bold' }}>
                {formatNumber(
                  Object.values(groupedData).flat().reduce((sum, item) => sum + item.debitos, 0)
                )}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>Total Créditos:</span> 
              <span style={{ color: '#e74c3c', marginLeft: '10px', fontWeight: 'bold' }}>
                {formatNumber(
                  Object.values(groupedData).flat().reduce((sum, item) => sum + item.creditos, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <footer style={{ 
        textAlign: 'center', 
        color: '#7f8c8d', 
        fontSize: '0.9rem',
        marginTop: '20px'
      }}>
        Sistema Contable - Libro Diario © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default LibroDiario;