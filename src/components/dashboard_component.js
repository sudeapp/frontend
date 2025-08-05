import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClipboardList, 
  faSearch, 
  faListAlt, 
  faShieldAlt, 
  faEye,
  faChartPie,
  faChartBar,
  faChartLine,
  faColumns
} from '@fortawesome/free-solid-svg-icons';
import { FaBars } from 'react-icons/fa';

const DashboardComponent = ({ setCurrentComponent }) => {
  const [activeChart, setActiveChart] = useState('bar');
  const [selectedPeriod, setSelectedPeriod] = useState('mensual');
  
  const css = `
    .accounting-module {
      font-family: sans-serif;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    
    .actions-bar {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .action-card {
      background-color: var(--bs-success-bg-subtle);
      color: var(--button-hover-bg);
      border: 1px solid var(--bs-success-border-subtle);
      padding: 30px 20px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      
      transition: all 0.3s ease;
      flex: 1;
      min-width: 180px;
    }
    
    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .action-icon {
      font-size: 1.5em;
      margin-bottom: 8px;
    }
    
    .dashboard-title {
      color: #198754;
      border-bottom: 2px solid #4caf50;
      padding-bottom: 10px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }
    
    .dashboard-title-icon {
      margin-right: 10px;
      font-size: 1.5em;
    }
    
    .chart-controls {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .chart-selector {
      display: flex;
      gap: 10px;
    }
    
    .chart-btn {
      padding: 8px 15px;
      border: none;
      border-radius: 5px;
      background: #e8f5e9;
      color: #388e3c;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    
    .chart-btn.active {
      background: #198754;
      color: white;
    }
    
    .chart-btn:hover:not(.active) {
      background: #c8e6c9;
    }
    
    .period-selector select {
      padding: 8px 15px;
      border: 1px solid #c8e6c9;
      border-radius: 5px;
      background: white;
      color: #388e3c;
      font-weight: bold;
    }
    
    .charts-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .chart-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      height: 26rem;
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .chart-title {
      font-size: 1.2em;
      color: #2a6a5f;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .chart-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .chart {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .chart-placeholder {
      width: 90%;
      /*height: 90%;*/
      background: #f5f5f5;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #757575;
      font-weight: bold;
      text-align: center;
      padding:1.2rem;
    }
    
    .chart-icon {
      font-size: 3em;
      margin-bottom: 15px;
      color: #c8e6c9;
    }
    
    .stats-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 1.8em;
      font-weight: bold;
      color: #2e7d32;
      margin: 10px 0;
    }
    
    .stat-label {
      color: #757575;
      font-size: 0.9em;
    }
    
    .stat-trend {
      display: flex;
      align-items: center;
      font-size: 0.9em;
      margin-top: 5px;
    }
    
    .trend-up {
      color: #4caf50;
    }
    
    .trend-down {
      color: #f44336;
    }
    
    .recent-activity {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .activity-title {
      font-size: 1.2em;
      color: #2e7d32;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
      font-weight: bold;
    }
    
    .activity-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f5f5f5;
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-description {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .activity-icon {
      color: #388e3c;
    }
    
    .activity-amount {
      font-weight: bold;
      color: #2e7d32;
    }
    
    @media (max-width: 1200px) {
      .charts-container {
        grid-template-columns: 1fr;
      }
      
      .stats-summary {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .actions-bar {
        flex-wrap: wrap;
      }
      
      .action-card {
        min-width: calc(50% - 15px);
      }
      
      .stats-summary {
        grid-template-columns: 1fr;
      }
    }
  `;

  // Datos de ejemplo para los gráficos
  const pieData = [
    { category: 'Nómina', value: 35, color: '#4caf50' },
    { category: 'Impuestos', value: 25, color: '#ff9800' },
    { category: 'Servicios', value: 20, color: '#2196f3' },
    { category: 'Suministros', value: 15, color: '#9c27b0' },
    { category: 'Otros', value: 5, color: '#f44336' }
  ];

  const barData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      { label: 'Ingresos', data: [12000, 19000, 15000, 18000, 22000, 25000], color: '#4caf50' },
      { label: 'Gastos', data: [8000, 12000, 10000, 15000, 18000, 16000], color: '#f44336' }
    ]
  };

  const lineData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      { label: 'Beneficios', data: [4000, 7000, 5000, 3000, 4000, 9000], color: '#2196f3' }
    ]
  };

  const columnData = {
    labels: ['Compras', 'Ventas', 'Servicios', 'Impuestos', 'Nómina'],
    datasets: [
      { label: 'Total', data: [15000, 45000, 12000, 8000, 22000], color: '#ff9800' }
    ]
  };

  // Función para renderizar el gráfico activo
  const renderActiveChart = () => {
    switch(activeChart) {
      case 'pie':
        return (
          <div className="chart">
            <div className="chart-placeholder">
              <FontAwesomeIcon icon={faChartPie} className="chart-icon" />
              <span>Diagrama de Torta - Distribución de Gastos</span>
              <div style={{ marginTop: '20px', width: '250px', height: '250px', position: 'relative' }}>
                {pieData.map((item, index) => (
                  <div key={index} style={{
                    position: 'absolute',
                    width: `${item.value * 2.5}px`,
                    height: `${item.value * 2.5}px`,
                    borderRadius: '50%',
                    border: `15px solid ${item.color}`,
                    clipPath: `polygon(50% 50%, ${index === 0 ? '100%' : '0%'} 50%, 0% 0%, 100% 0%)`,
                    transform: `rotate(${pieData.slice(0, index).reduce((acc, curr) => acc + curr.value * 3.6, 0)}deg)`,
                    transformOrigin: 'center'
                  }}></div>
                ))}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'white'
                }}></div>
              </div>
            </div>
          </div>
        );
      case 'bar':
        return (
          <div className="chart">
            <div className="chart-placeholder">
              <FontAwesomeIcon icon={faChartBar} className="chart-icon" />
              <span>Diagrama de Barras - Ingresos vs Gastos</span>
              <div style={{ display: 'flex', alignItems: 'flex-end',  gap: '20px' }}>
                {barData.labels.map((label, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '5px' }}>
                      <div style={{ 
                        width: '20px', 
                        height: `${barData.datasets[0].data[i] / 250}px`, 
                        background: barData.datasets[0].color,
                        borderRadius: '4px 4px 0 0'
                      }}></div>
                      <div style={{ 
                        width: '20px', 
                        height: `${barData.datasets[1].data[i] / 250}px`, 
                        background: barData.datasets[1].color,
                        borderRadius: '4px 4px 0 0'
                      }}></div>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.8em' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '15px', height: '15px', background: barData.datasets[0].color }}></div>
                  <span>{barData.datasets[0].label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '15px', height: '15px', background: barData.datasets[1].color }}></div>
                  <span>{barData.datasets[1].label}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'line':
        return (
          <div className="chart">
            <div className="chart-placeholder">
              <FontAwesomeIcon icon={faChartLine} className="chart-icon" />
              <span>Diagrama Lineal - Evolución de Beneficios</span>
              <div style={{ position: 'relative', height: '200px', width: '100%', marginTop: '20px' }}>
                <div style={{ 
                  position: 'absolute', 
                  bottom: '0', 
                  left: '0', 
                  width: '100%', 
                  height: '2px', 
                  background: '#ddd' 
                }}></div>
                {lineData.labels.map((label, i) => (
                  <div key={i} style={{ 
                    position: 'absolute', 
                    bottom: '0', 
                    left: `${i * (100 / (lineData.labels.length - 1))}%`, 
                    transform: 'translateX(-50%)', 
                    height: '10px', 
                    width: '1px', 
                    background: '#ddd' 
                  }}>
                    <div style={{ position: 'absolute', bottom: '-20px', left: '0', fontSize: '0.8em' }}>{label}</div>
                  </div>
                ))}
                <div style={{ 
                  position: 'absolute', 
                  bottom: '0', 
                  left: '0', 
                  width: '100%', 
                  height: '180px', 
                  display: 'flex', 
                  alignItems: 'flex-end' 
                }}>
                  {lineData.datasets[0].data.map((value, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      left: `${i * (100 / (lineData.datasets[0].data.length - 1))}%`,
                      bottom: `${(value / 10000) * 100}%`,
                      transform: 'translateX(-50%)',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: lineData.datasets[0].color,
                      border: '2px solid white'
                    }}></div>
                  ))}
                  {lineData.datasets[0].data.map((value, i, arr) => {
                    if (i === arr.length - 1) return null;
                    return (
                      <div key={i} style={{
                        position: 'absolute',
                        left: `${i * (100 / (arr.length - 1))}%`,
                        bottom: `${(value / 10000) * 100}%`,
                        width: `${100 / (arr.length - 1)}%`,
                        height: '2px',
                        background: lineData.datasets[0].color,
                        transformOrigin: 'left center',
                        transform: `rotate(${Math.atan2(
                          ((arr[i+1] / 10000) * 100) - ((value / 10000) * 100),
                          100 / (arr.length - 1)
                        )}rad)`
                      }}></div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      case 'column':
        return (
          <div className="chart">
            <div className="chart-placeholder">
              <FontAwesomeIcon icon={faColumns} className="chart-icon" />
              <span>Diagrama de Columnas - Resumen por Categoría</span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', marginTop: '15px' }}>
                {columnData.labels.map((label, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      width: '30px', 
                      height: `${columnData.datasets[0].data[i] / 300}px`, 
                      background: columnData.datasets[0].color,
                      borderRadius: '4px 4px 0 0'
                    }}></div>
                    <div style={{ marginTop: '10px', fontSize: '0.8em', textAlign: 'center', width: '70px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <div>Seleccione un gráfico</div>;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="accounting-module">
        <h2 className="dashboard-title">
          <FontAwesomeIcon icon={faChartPie} className="dashboard-title-icon" />
          Dashboard de Contabilidad
        </h2>
        
        <div className="actions-bar">
          <div className="action-card">
            <FontAwesomeIcon icon={faClipboardList} className="action-icon" />
            <span>Carga de Comprobantes</span>
          </div>
          <div className="action-card">
            <FontAwesomeIcon icon={faSearch} className="action-icon" />
            <span>Consulta de Comprobantes</span>
          </div>
          <div className="action-card">
            <FontAwesomeIcon icon={faListAlt} className="action-icon" />
            <span>Listado de Aprobación</span>
          </div>
          <div className="action-card">
            <FontAwesomeIcon icon={faShieldAlt} className="action-icon" />
            <span>Parámetros Contables</span>
          </div>
        </div>
        
        <div className="chart-controls">
          <div className="chart-selector">
            {/*<button 
              className={`chart-btn ${activeChart === 'pie' ? 'active' : ''}`}
              onClick={() => setActiveChart('pie')}
            >
              <FontAwesomeIcon icon={faChartPie} />
              Diagrama de Torta
            </button>
            <button 
              className={`chart-btn ${activeChart === 'line' ? 'active' : ''}`}
              onClick={() => setActiveChart('line')}
            >
              <FontAwesomeIcon icon={faChartLine} />
              Diagrama Lineal
            </button>*/}
            <button 
              className={`chart-btn ${activeChart === 'bar' ? 'active' : ''}`}
              onClick={() => setActiveChart('bar')}
            >
              <FontAwesomeIcon icon={faChartBar} />
              Diagrama de Barras
            </button>
            
            <button 
              className={`chart-btn ${activeChart === 'column' ? 'active' : ''}`}
              onClick={() => setActiveChart('column')}
            >
              <FontAwesomeIcon icon={faColumns} />
              Diagrama de Columnas
            </button>
          </div>
          
          <div className="period-selector">
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">
              <FontAwesomeIcon icon={
                activeChart === 'pie' ? faChartPie : 
                activeChart === 'bar' ? faChartBar : 
                activeChart === 'line' ? faChartLine : 
                faColumns
              } />
              {activeChart === 'pie' && 'Distribución de Gastos'}
              {activeChart === 'bar' && 'Ingresos vs Gastos Mensuales'}
              {activeChart === 'line' && 'Evolución de Beneficios'}
              {activeChart === 'column' && 'Resumen Financiero por Categoría'}
            </div>
            <div>
              <span className="stat-label">Período: {selectedPeriod}</span>
            </div>
          </div>
          <div className="chart-content">
            {renderActiveChart()}
          </div>
        </div>
        
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-label">Ingresos Totales</div>
            <div className="stat-value">$142,560</div>
            <div className="stat-trend trend-up">
              <span>↑ 12.5% vs período anterior</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Gastos Totales</div>
            <div className="stat-value">$86,340</div>
            <div className="stat-trend trend-down">
              <span>↓ 3.2% vs período anterior</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Beneficio Neto</div>
            <div className="stat-value">$56,220</div>
            <div className="stat-trend trend-up">
              <span>↑ 24.7% vs período anterior</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Comprobantes</div>
            <div className="stat-value">142</div>
            <div className="stat-trend trend-up">
              <span>↑ 8.4% vs período anterior</span>
            </div>
          </div>
        </div>
        
        <div className="charts-container">
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">
                <FontAwesomeIcon icon={faChartBar} />
                Ingresos por Mes
              </div>
            </div>
            <div className="chart-content">
              <div className="chart">
                <div className="chart-placeholder">
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '15px', marginTop: '20px' }}>
                    {barData.labels.map((label, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ 
                          width: '25px', 
                          height: `${barData.datasets[0].data[i] / 250}px`, 
                          background: '#4caf50',
                          borderRadius: '4px 4px 0 0'
                        }}></div>
                        <div style={{ marginTop: '10px', fontSize: '0.8em' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">
                <FontAwesomeIcon icon={faChartLine} />
                Evolución de Gastos
              </div>
            </div>
            <div className="chart-content">
              <div className="chart">
                <div className="chart-placeholder">
                  <div style={{ position: 'relative', height: '200px', width: '100%', marginTop: '20px' }}>
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '0', 
                      left: '0', 
                      width: '100%', 
                      height: '2px', 
                      background: '#ddd' 
                    }}></div>
                    {lineData.labels.map((label, i) => (
                      <div key={i} style={{ 
                        position: 'absolute', 
                        bottom: '0', 
                        left: `${i * (100 / (lineData.labels.length - 1))}%`, 
                        transform: 'translateX(-50%)', 
                        height: '10px', 
                        width: '1px', 
                        background: '#ddd' 
                      }}>
                        <div style={{ position: 'absolute', bottom: '-20px', left: '0', fontSize: '0.8em' }}>{label}</div>
                      </div>
                    ))}
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '0', 
                      left: '0', 
                      width: '100%', 
                      height: '180px', 
                      display: 'flex', 
                      alignItems: 'flex-end' 
                    }}>
                      {barData.datasets[1].data.map((value, i) => (
                        <div key={i} style={{
                          position: 'absolute',
                          left: `${i * (100 / (barData.datasets[1].data.length - 1))}%`,
                          bottom: `${(value / 25000) * 100}%`,
                          transform: 'translateX(-50%)',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#f44336',
                          border: '2px solid white'
                        }}></div>
                      ))}
                      {barData.datasets[1].data.map((value, i, arr) => {
                        if (i === arr.length - 1) return null;
                        return (
                          <div key={i} style={{
                            position: 'absolute',
                            left: `${i * (100 / (arr.length - 1))}%`,
                            bottom: `${(value / 25000) * 100}%`,
                            width: `${100 / (arr.length - 1)}%`,
                            height: '2px',
                            background: '#f44336',
                            transformOrigin: 'left center',
                            transform: `rotate(${Math.atan2(
                              ((arr[i+1] / 25000) * 100) - ((value / 25000) * 100),
                              100 / (arr.length - 1)
                            )}rad)`
                          }}></div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="recent-activity">
          <div className="activity-title">Actividad Reciente</div>
          <div>
            <div className="activity-item">
              <div className="activity-description">
                <FontAwesomeIcon icon={faClipboardList} className="activity-icon" />
                <span>Comprobante #001245 - Pago a Proveedores</span>
              </div>
              <div className="activity-amount">$12,450.00</div>
            </div>
            <div className="activity-item">
              <div className="activity-description">
                <FontAwesomeIcon icon={faClipboardList} className="activity-icon" />
                <span>Comprobante #001244 - Facturación Clientes</span>
              </div>
              <div className="activity-amount">$23,780.00</div>
            </div>
            <div className="activity-item">
              <div className="activity-description">
                <FontAwesomeIcon icon={faClipboardList} className="activity-icon" />
                <span>Comprobante #001243 - Pago Nómina</span>
              </div>
              <div className="activity-amount">$18,340.00</div>
            </div>
            <div className="activity-item">
              <div className="activity-description">
                <FontAwesomeIcon icon={faClipboardList} className="activity-icon" />
                <span>Comprobante #001242 - Impuestos</span>
              </div>
              <div className="activity-amount">$7,560.00</div>
            </div>
            <div className="activity-item">
              <div className="activity-description">
                <FontAwesomeIcon icon={faClipboardList} className="activity-icon" />
                <span>Comprobante #001241 - Servicios</span>
              </div>
              <div className="activity-amount">$3,210.00</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardComponent;