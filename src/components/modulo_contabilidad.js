import React, { useEffect,useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faSearch, faListAlt, faShieldAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import { FaBars} from 'react-icons/fa';

const ModuloContabilidad = ({ setCurrentComponent }) => {
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
      background-color: #e8f5e9; /* Light green background /
      color: #388e3c; / Darker green text */
      padding: 30px 20px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      border: 1px solid #c8e6c9;
    }   
    
    .action-icon {
    font-size: 1.5em;
    margin-bottom: 8px;
    }
    
    .table-header-section {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    }
    
    .maintenance-title {
    color: #333;
    font-weight: bold;
    display: flex;
    align-items: center;
    }
    
    .radio-button {
    width: 12px;
    height: 12px;
    border: 1px solid #333;
    border-radius: 50%;
    margin-right: 8px;
    }
    
    .data-table-container {
    overflow-x: auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .data-table {
    width: 100%;
    border-collapse: collapse;
    }
    
    .data-table th, .data-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    }
    
    .data-table th {
    background-color: #f2f2f2;
    font-weight: bold;
    }
    
    .data-table tbody tr:last-child td {
    border-bottom: none;
    }
    
    .status-pending {
    background-color: #fff8e1; /* Light yellow /
    color: #f9a825; / Amber */
    padding: 5px 10px;
    border-radius: 5px;
    /*display: inline-block;*/
    }
    
    .eye-icon {
    color: #777;
    cursor: pointer;
    }
`;

    const handleChangeComponent = (currents) => {
      setCurrentComponent(currents);
    };

  return (
    <>
    <style>{css}</style>
    <h2 className="module-title">Módulo de Contabilidad</h2>
      <div className="actions-bar">
        <div className="action-card" onClick={() => handleChangeComponent('registroComprobantes')}>
          <FontAwesomeIcon icon={faClipboardList} className="action-icon" />
          <span>Carga de Comprobantes</span>
          
        </div>
        <div className="action-card" onClick={() => handleChangeComponent('consultaComprobantes')}>
          <FontAwesomeIcon icon={faSearch} className="action-icon" />
          <span>Consulta de Comprobantes</span>
        </div>
        <div className="action-card" onClick={() => handleChangeComponent('consultaComprobanteAprobacion')}>
          <FontAwesomeIcon icon={faListAlt} className="action-icon" />
          <span>Listado de Aprobación</span>
        </div>
        <div className="action-card" onClick={() => handleChangeComponent('consultaVpc')}>
          <FontAwesomeIcon icon={faShieldAlt} className="action-icon" />
          <span>Parámetros Contables</span>
        </div>
      </div>

  <div className="table-header-section">
    <div className="maintenance-title">
      <span className="radio-button"></span>
      Mantenimiento de Comprobantes
    </div>
  </div>

  <div className="data-table-container">
    <table className="data-table">
      <thead>
        <tr>
          <th>Secuencia</th>
          <th>Fecha Valor</th>
          <th>Débitos</th>
          <th>Créditos</th>
          <th>Estatus</th>
          <th></th> {/* For the eye icon */}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>000001</td>
          <td>000000</td>
          <td>000000</td>
          <td>000000</td>
          <td className="status-pending">Pendiente Por Revisar</td>
          <td><FontAwesomeIcon icon={faEye} className="eye-icon" /></td>
        </tr>
        {/* Add more rows here as needed */}
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>

    </>
  )
}

export default ModuloContabilidad;