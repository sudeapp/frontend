import React, { useEffect,useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faSearch, faListAlt, faShieldAlt, faEye,faChartPie } from '@fortawesome/free-solid-svg-icons';
import { FaBars} from 'react-icons/fa';
import axios from 'axios';
import config from '../config';
import Cookies from 'universal-cookie';
import { show_alerta, show_alerta2 } from '../functions';

const ModuloCierre = ({ setCurrentComponent }) => {
  const cookies = new Cookies();
  const baseUrl = config.API_BASE_URL;
  const [userId, setUserId] = useState(cookies.get('idUsuario'));
  const [token, setToken] = useState(cookies.get('token'));
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  const [isSpinnerMensual, setIsSpinnerMensual] = useState(false);
  const [isSpinnerAnual, setIsSpinnerAnual] = useState(false);

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
      max-width: 180px;
    }

    .action-card:hover {
      background-color: var(--bs-success-bg-subtle);
      transform: translateY(-5px) !important;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
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
      font-size: 1.3rem;

    }
    
    .dashboard-title-icon {
      margin-right: 10px;
      font-size: 1.5em;
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

    .module-title {
      color: var(--bs-gray-700);
      padding-bottom: 12px;
      font-size: 1.2rem;
      font-weight: normal;
      font-family: sans-serif;
  }
`;

    const handleChangeComponent = (currents) => {
      setCurrentComponent(currents);
    };

    const handleCierreMensual = async () => {  
      setIsSpinnerMensual(true);
  
      try {
        let params = {
          idCaho: idCaho,
          idUsuario:userId
        };
  
        var response = await axios.get(
          `${baseUrl}/api/cajas-ahorro/cierre-mensual`,
          {
            params: params,
            headers: {
              Authorization: `${token}`,
            }
          }
        );
        console.log(response);
        if (response.status === 200 && response.data.data === true) {
          show_alerta('Cierre mensual realizado exitosamente' , 'success');
        }else{
          show_alerta('Cierre mensual no fue realizado, intente más tarde' , 'error');
        }
      } catch (error) {
        if (error.response?.status === 400) {
          show_alerta(error.response.data, 'error');
        } else {
          show_alerta('Error al realizar cierre mensual', 'error');
        }
      } finally {
        setIsSpinnerMensual(false);
  
      }
    };

    const handleCierreAnual = async () => {
  
      setIsSpinnerAnual(true);
  
      try {
        let params = {
          idCaho: idCaho,
          idUsuario:userId
        };
  
        var response = await axios.get(
          `${baseUrl}/api/cajas-ahorro/cierre-anual`,
          {
            params: params,
            headers: {
              Authorization: `${token}`,
            }
          }
        );
  
        if (response.status === 200 && response.data.data === true) {
          show_alerta('Cierre anual realizado exitosamente' , 'success');
        }else{
          show_alerta('Cierre anual no fue realizado, intente más tarde' , 'error');
        }
      } catch (error) {
        if (error.response?.status === 400) {
          show_alerta(error.response.data, 'error');
        } else {
          show_alerta('Error al realizar cierre anual', 'error');
        }
      } finally {
        setIsSpinnerAnual(false);
      }
    };
  
  return (
    <>
    <style>{css}</style>
      {/*<h2 className="module-title">Reportes</h2>*/}

      <h2 className="dashboard-title">
          <FontAwesomeIcon icon={faChartPie} className="dashboard-title-icon" />
          Cierre Contable
      </h2>
      <div className="actions-bar">
        <div className="action-card" onClick={() => handleCierreMensual()}>
          <FontAwesomeIcon icon={faClipboardList} className="action-icon" />
          
          {isSpinnerMensual ? (
            <div className="spinner"></div>
          ) : (
            <span>Cierre Mensual</span>
          )}
        </div>

        <div className="action-card" onClick={() => handleCierreAnual()}>
          <FontAwesomeIcon icon={faClipboardList} className="action-icon" />
          {isSpinnerAnual ? (
            <div className="spinner"></div>
          ) : (
            <span>Cierre del Ejercicio</span>
          )}
        </div>
      </div>

    </>
  )
}

export default ModuloCierre;