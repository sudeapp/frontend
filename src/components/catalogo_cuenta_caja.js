import React, { useState, useRef, useEffect } from 'react';
import '../assets/css/catalogoCuenta.css';
import { FaBroom, FaTimesCircle, FaEdit, FaPencilAlt, FaTrash, FaToggleOn, FaToggleOff, FaSearch } from 'react-icons/fa';
import { CiImport, CiTrash, CiExport } from "react-icons/ci";
import { show_alerta,show_alerta2 } from '../functions';
import axios from 'axios';
import config from '../config';
import Cookies from 'universal-cookie';


const CatalogoCuentaCaja = ({ setCurrentComponent }) => {
  const cookies = new Cookies();
  const baseUrl = config.API_BASE_URL;
  const [cuenta, setCuenta] = useState('');
  const [auxiliarTipo, setAuxiliarTipo] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isConsulting, setIsConsulting] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [userId, setUserId] = useState(cookies.get('idUsuario'));
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  const [token, setToken] = useState(cookies.get('token'));
  const [idPlanContable, setIdPlanContable] = useState(cookies.get('idPlanContable'));
  const [isSpinnerModifying, setIsSpinnerModifying] = useState(false);
  const [idTipoAux, setIdTipoAux] = useState('');
  const [movimiento, setMovimiento] = useState('1');
  const [resCodigoContable, setResCodigoContable] = useState('');
  const [cuentas, setCuentas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);


  // Cargar tipos de auxiliar y cuentas existentes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar tipos de auxiliar
        const tipoAuxResponse = await axios.get(baseUrl + '/api/auxiliar-tipo/lista-auxiliar-tipo', {
          headers: token ? { Authorization: `${token}` } : {}
        });
        setAuxiliarTipo(tipoAuxResponse.data.data);
       
        // Cargar cuentas existentes
        const cuentasResponse = await axios.get(baseUrl + '/api/plan-catalogo/lista', {
          headers: token ? { Authorization: `${token}` } : {},
          params: {
            idPlanContable: idPlanContable
          }
        });
        console.log("cuentasResponse.data.data ",cuentasResponse.data.data );
        setCuentas(cuentasResponse.data.data || []);
        
      } catch (error) {
        show_alerta('Error al cargar los datos', 'error');
      }
    };
   
    fetchData();
  }, []);


  // Método para validar el código contable
  const validarCodigoContable = async (idCaho, cuenta) => {
    try {
      const response = await axios.get(baseUrl + '/api/plan-catalogo/validar-cuenta-caja', {
        headers: token ? { Authorization: `${token}` } : {},
        params: {
          idCaho: idCaho,
          cuenta: cuenta
        }
      });
     
      if (response.data){
        console.log("response.data.data 1",response.data.data)
        return response.data.data;
      }else{
        return null;
      }
    } catch (err) {
      console.error('Error en la validación:', err);
      return null;
    }
  };


  // Filtrar cuentas basado en el término de búsqueda
  const filteredCuentas = cuentas.filter(cuentaItem =>
    cuentaItem.cuenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cuentaItem.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Manejar selección de filas
  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };


  // Manejar seleccionar todos
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredCuentas.map(item => item.idPlanCatalogo));
    }
    setSelectAll(!selectAll);
  };


  // Cargar datos para edición
  const loadDataForEdit = (cuentaItem) => {
    setCuenta(cuentaItem.cuenta);
    setDescripcion(cuentaItem.descripcion);
    setIdTipoAux(cuentaItem.idTaux || '');
    setMovimiento(cuentaItem.movimiento ? "1" : "0");
    setEditingId(cuentaItem.idPlanCatalogo);
    setIsConsulting(true);

    // Desplazar al formulario
    document.getElementById('header-section').scrollIntoView({ behavior: 'smooth' });
  };


  // Limpiar formulario
  const handleClean = () => {
    setCuenta('');
    setDescripcion('');
    setIdTipoAux('');
    setMovimiento('1');
    setEditingId(null);
    setIsConsulting(false);
  };


  // Eliminar cuenta
  const handleDelete = async (id) => {
    const result = await show_alerta2('¿Está seguro de eliminar esta cuenta?', 'warning', true);
    if (!result) return;
    console.log(id)
    try {
      await axios.delete(`${baseUrl}/api/plan-catalogo/eliminar`, {
        headers: {
          Authorization: `${token}`
        },
        params: {
          id: id
        }
      });
     
      show_alerta('Cuenta eliminada exitosamente', 'success');
      setCuentas(cuentas.filter(item => item.idPlanCatalogo !== id));
    } catch (error) {
      show_alerta('Error al eliminar la cuenta', 'error');
    }
  };


  // Eliminar múltiples cuentas
  const handleDeleteMultiple = async () => {
    console.log("selectedRows.length",selectedRows.length)
    if (selectedRows.length === 0) {
      show_alerta('Seleccione al menos una cuenta para eliminar', 'warning');
      return;
    }


    const result = await show_alerta2(`¿Está seguro de eliminar ${selectedRows.length} cuenta(s)?`, 'warning', true);
    if (!result) return;


    try {
      for (const id of selectedRows) {
        await axios.delete(`${baseUrl}/api/plan-catalogo/eliminar`, {
          headers: {
            Authorization: `${token}`
          },
          params: {
            id: id
          }
        });
      }
     
      show_alerta('Cuentas eliminadas exitosamente', 'success');
      setCuentas(cuentas.filter(item => !selectedRows.includes(item.idPlanCatalogo)));
      setSelectedRows([]);
      setSelectAll(false);
    } catch (error) {
      show_alerta('Error al eliminar las cuentas', 'error');
    }
  };


  // Enviar formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
   
    if (!cuenta || !descripcion) {
      show_alerta('Los campos Cuenta y Descripción son obligatorios', 'error');
      return false;
    }
   
    
    setIsSpinnerModifying(true);
   
    try {
      
      var formData;
      let response;
     
      if (editingId) {
        formData = {
            idPlanCatalogo: editingId,
            descripcion: descripcion
        };

        // Modificar cuenta existente
        response = await axios.put(
          `${baseUrl}/api/plan-catalogo/update`,
          formData,
          {
            headers: {
              Authorization: `${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        const resCodigoContable = await validarCodigoContable(idCaho, cuenta);
        if (resCodigoContable == null) {
            show_alerta('Error en la validación del código contable', 'error');
            return;
        }

        if (!resCodigoContable.es_valido) {
            show_alerta('Error: ' + resCodigoContable.mensaje, 'error');
            return;
        }
   
        console.log("resCodigoContable.es_valido",resCodigoContable.es_valido)
        /*const auxiliarTipo = {
            idTaux : idTipoAux || null,
        }*/
        formData = {
            idPlanContable: idPlanContable,
            cuenta: cuenta,
            descripcion: descripcion,
            auxiliarTipo: idTipoAux != 0 ? { idTaux : idTipoAux } : null,
            //movimiento: movimiento === "1",
            movimiento: true,
            nivel: resCodigoContable.nivel_cuenta,
            longitud: resCodigoContable.longitud_cuenta,
            idCuentaAsc: resCodigoContable.id_cuenta_padre,
            estatusCuenta: true,
            tplan: 2,
            monetaria: false
        };
    
        console.log("DATASSSSSSS",formData)
        //return false;
        // Crear nueva cuenta
        response = await axios.post(
          `${baseUrl}/api/plan-catalogo/save`,
          formData,
          {
            headers: {
              Authorization: `${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log("DATASSSSSSS response",response)
      }
 
      if (response.status === 200 || response.status === 201) {
        show_alerta(editingId ? 'Registro actualizado exitosamente' : 'Registro guardado exitosamente', 'success');
       
        // Actualizar la lista de cuentas
        if (editingId) {
          setCuentas(cuentas.map(item =>
            item.idPlanCatalogo === editingId ? { ...item, ...formData } : item
          ));
        } else {
            console.log("formData",formData);
            console.log("response.data save",response.data);
          // Agregar nueva cuenta a la tabla
          setCuentas([...cuentas, { ...response.data, idPlanCatalogo: response.data.idPlanCatalogo }]);
        }
       
        // Limpiar formulario
        handleClean();
      }
    } catch (error) {
      if (error.response?.status === 409) {
        show_alerta(error.response.data, 'error');
      } else {
        show_alerta('Error al guardar el registro', 'error');
      }
    } finally {
      setIsSpinnerModifying(false);
    }
  };


  return (
    <div className="catalogo-cuenta-container">
      <div id="header-section"  className="header" style={{ borderBottom: "0.5px solid #DDD"}}>
        <button className="regresar-button" onClick={() => setCurrentComponent('moduloContabilidad')}>
          <span className="icon">←</span> Regresar
        </button>
        <h2 className="titulo">
          Catálogo de Cuentas
        </h2>
      </div>


      <div id="form-section" className="form-section">
        <div className="form-row top-row"></div>


        <div className="form-row">
          <div className="form-group auxiliar">
            <label htmlFor="cuenta">Cuenta</label>
            <div className="input-with-search">
              <input
                type="text"
                id="cuenta"
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value)}
                style={{width: "206px"}}
                required
                disabled={editingId}
                maxLength={20}
              />
            </div>
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="descripcion">Descripción</label>
            <div className="input-with-search">
              <input
                type="text"
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                maxLength={120}
              />
            </div>
          </div>
        </div>


        <div className="form-row col-6">
          <div className="form-group">
            <label htmlFor="auxiliar">Tipo Auxiliar</label>
            <div className='input-with-icon'>
              <select
                id="tipo_aux"
                value={idTipoAux}
                className="custom-select"
                onChange={(e) => setIdTipoAux(e.target.value)}
                disabled={editingId}
              >
                <option value="0">Seleccione un tipo auxiliar</option>
                {auxiliarTipo && auxiliarTipo.map(aux => (
                  <option key={aux.idTaux} value={aux.idTaux}>
                    {aux.codTaux} - {aux.descTaux}
                  </option>
                ))}
              </select>
            </div>
          </div>
         
          {/*<div className="form-group" >
            <label htmlFor="movimiento">¿Imputable?</label>
            <div className='input-with-icon' style={{width:"97%"}}>
              <select
                value={movimiento}
                id="movimiento"
                className="custom-select"
                onChange={(e) => setMovimiento(e.target.value)}
                disabled={editingId}
              >
                <option value="1">Sí</option>
                <option value="0">No</option>
              </select>
            </div>
          </div>*/}
        </div>
      </div>


      <div className="actions-section" style={{/*borderTop: "0.5px solid #ddd" paddingTop: "20px",*/ marginTop: "20px"}}>
        {/*{!isConsulting &&*/}
          <button className="clean-button" onClick={handleClean}>
            <FaBroom style={{ marginRight: "0.5rem" }}/> Limpiar
          </button>
        {/*}*/}


        <button
          className="save-button"
          disabled={isSpinnerModifying}
          onClick={handleSubmit}
          id="saveCuenta"
        >
          {isSpinnerModifying ? (
            <div className="spinner"></div>
          ) : isConsulting ? (
            "Modificar Cuenta"
          ) : (
            "Guardar Cuenta"
          )}
        </button>
       
        <button className="delete-button" onClick={handleDeleteMultiple}>
          <CiTrash style={{ marginRight: "0.5rem", fontSize: "18px" }}/> Eliminar
        </button>
      </div>


      <div className="table-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar cuenta o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>


      <div className="table-section">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Cuenta</th>
              <th>Nombre</th>
              <th>Tipo Aux</th>
              <th>Imputable?</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCuentas.length > 0 ? (
              filteredCuentas.map(cuentaItem => {
                //const tipoAux = auxiliarTipo.find(aux => aux.idTaux === cuentaItem.idTaux);
                return (
                  <tr key={cuentaItem.idPlanCatalogo}>
                    <td>
                        {cuentaItem.tplan == 2 ?
                            <input
                                type="checkbox"
                                checked={selectedRows.includes(cuentaItem.idPlanCatalogo)}
                                onChange={() => handleRowSelect(cuentaItem.idPlanCatalogo)}
                                disabled={cuentaItem.tplan == 1}
                            />
                            :
                            ''
                        }
                    </td>
                    <td>{cuentaItem.cuenta}</td>
                    <td>{cuentaItem.descripcion}</td>
                    <td>{cuentaItem.auxiliarTipo ? `${cuentaItem.auxiliarTipo.codTaux} - ${cuentaItem.auxiliarTipo.descTaux}` : 'N/A'}</td>
                    <td>{cuentaItem.movimiento ? 'Sí' : 'No'}</td>
                    <td>
                        {cuentaItem.tplan == 2 ?
                            <div className="action-buttons">
                                <button
                                className="edit-btn"
                                onClick={() => loadDataForEdit(cuentaItem)}
                                >
                                <FaEdit />
                                </button>
                                <button
                                className="delete-btn"
                                onClick={() => handleDelete(cuentaItem.idPlanCatalogo)}
                                >
                                <FaTrash />
                                </button>
                            </div>
                            :
                            '-'
                        }
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      <style jsx>{`
        .catalogo-cuenta-container {
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
       
      
        .regresar-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          margin-right: 20px;
        }
              
        .titulo {
          color: #333;
          margin: 0;
          font-size: 24px;
        }
       
        .form-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
       
        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
       
        .form-group {
          flex: 1;
        }
       
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #495057;
        }
       
        .input-with-search input,
        .custom-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }
       
        .actions-section {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
       
        .clean-button, .save-button, .delete-button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-weight: 500;
        }
       
        .clean-button {
          background: #ffc107;
          color: #212529;
        }
       
        .clean-button:hover {
          background: #e0a800;
        }
       
        .save-button {
          background: #28a745;
          color: white;
        }
       
        .save-button:hover:not(:disabled) {
          background: #218838;
        }
       
        .save-button:disabled {
          background: #b3d9b9;
          cursor: not-allowed;
        }
       
        .delete-button {
          background: #dc3545;
          color: white;
        }
       
        .delete-button:hover {
          background: #c82333;
        }
       
        .table-controls {
          margin-bottom: 15px;
          display: flex;
          justify-content: flex-end;
        }
       
        .search-box {
          position: relative;
          width: 300px;
        }
       
        .search-box input {
          width: 100%;
          padding: 8px 12px 8px 35px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }
       
        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }
       
        .table-section {
          background: white;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }
       
        table {
          width: 100%;
          border-collapse: collapse;
        }
       
        th {
          background: #e9ecef;
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
        }
       
        td {
          padding: 12px 15px;
          border-bottom: 1px solid #dee2e6;
          color: #6c757d;
        }
       
        .action-buttons {
          display: flex;
          gap: 8px;
        }
       
        .edit-btn, .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 5px;
          border-radius: 4px;
        }
       
        .edit-btn {
          color: #002A26;
        }
       
        .edit-btn:hover {
          background: #e9ecef;
        }
       
        .delete-btn {
          color: #dc3545;
        }
       
        .delete-btn:hover {
          background: #e9ecef;
        }
       
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
       
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};


export default CatalogoCuentaCaja;

