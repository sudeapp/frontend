import React, { useEffect,useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faSearch, faListAlt, faShieldAlt, faEye,faChartPie } from '@fortawesome/free-solid-svg-icons';
import { FaBars} from 'react-icons/fa';
import { show_alerta,show_alerta2 } from '../functions';
import axios from 'axios';
import config from '../config';
import Cookies from 'universal-cookie';
import '../assets/css/moduloContabilidad.css'; 

const Informe = ({ setCurrentComponent,setComprobanteSeleccionado }) => {
 
  const cookies = new Cookies();
  const baseUrl = config.API_BASE_URL;
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(cookies.get('idUsuario'));
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  const [token, setToken] = useState(cookies.get('token'));
  const [isShowBtnComprobante, setIsShowBtnComprobante] = useState(false);
  const [isShowBtnAprobacion, setIsShowBtnAprobacion] = useState(false);
  const [isShowBtnCatalogo, setIsShowBtnCatalogo] = useState(false);

  const handleChangeComponent = (currents) => {
    setCurrentComponent(currents);
  };

  useEffect(() => {
    if(cookies.get('permisologia') == 2){
      setIsShowBtnComprobante(true);
      setIsShowBtnAprobacion(true);
      setIsShowBtnCatalogo(true);
    }

    if(cookies.get('permisologia') == 4){
      setIsShowBtnComprobante(true);
    }

    if(cookies.get('permisologia') == 5){
      setIsShowBtnComprobante(true);
      setIsShowBtnAprobacion(true);
      setIsShowBtnCatalogo(true);
    }

    handleConsultar();
  }, []);

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
    console.log("idCaho",idCaho)
    try {
      
      const response = await axios.get(`${baseUrl}/api/comprobante/ultimos-comprobantes`, {
        headers: token ? { Authorization: `${token}` } : {},
        params : {
          idCaho:idCaho,
          idUsuario:userId
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
        estatusCbte: comprobante.estatusCbte,
        fechaCbte:comprobante.fechaCbte,
        idCaho:comprobante.idCaho,
        nroCbte:comprobante.nroCbte,
        comprobanteDet: comprobante.comprobanteDet,
        isConsulting:false
      }));
      setComprobantes(comprobantesMapeados);
      
    } catch (err) {
      console.error('Error al consultar comprobantes:', err);
      setError('Error al cargar los datos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (comprobante) => {
    console.log("comprobante:",comprobante)
    
    setComprobanteSeleccionado(comprobante);
    setCurrentComponent('detalleComprobantes');
  };

  return (
    <div className="modulo-contabilidad-container">
      <h2 className="dashboard-title">
          <FontAwesomeIcon icon={faChartPie} className="dashboard-title-icon" />
          Módulo de Contabilidad
      </h2>
      <div className="actions-bar">
        {isShowBtnComprobante ?
          <div className="action-card" onClick={() => handleChangeComponent('registroComprobantes')}>
            <FontAwesomeIcon icon={faClipboardList} className="action-icon" />
            <span>Carga de Comprobantes</span>
          </div>
          : ''
        }
        
        <div className="action-card" onClick={() => handleChangeComponent('consultaComprobantes')}>
          <FontAwesomeIcon icon={faSearch} className="action-icon" />
          <span>Consulta de Comprobantes</span>
        </div>

        {isShowBtnAprobacion?
          <div className="action-card" onClick={() => handleChangeComponent('consultaComprobanteAprobacion')}>
            <FontAwesomeIcon icon={faListAlt} className="action-icon" />
            <span>Aprobación y Actualización</span>
          </div>
          : ''
        }
        
        {isShowBtnCatalogo ?
          <div className="action-card" onClick={() => handleChangeComponent('catalogoCuentaCaja')}>
            <FontAwesomeIcon icon={faListAlt} className="action-icon" />
            <span>Catálogo de Cuentas</span>
          </div>
          : ''
        }
        
      </div>

      {/* Sección de la Tabla */}
      <section className="table-section">
        <table>
          <thead>
            <tr>
              <th>Secuencia</th>
              <th>Fecha Valor</th>
              <th>Usuario</th>
              <th style={{textAlign: 'center'}}>Débitos</th>
              <th style={{textAlign: 'center'}}>Créditos</th>
              <th style={{textAlign: 'center'}}>Comprobante</th>
              <th>Estatus</th>
              <th></th> {/* Columna para el icono de ojo */}
            </tr>
          </thead>
          <tbody>
            {comprobantes.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.fechaValor}</td>
                <td>{item.usuario}</td>
                <td className="text-right">{item.debitos}</td>
                <td className="text-right">{item.creditos}</td>
                <td style={{textAlign: 'center'}}>{item.comprobante}</td>
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
                <td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  )
}

export default Informe;