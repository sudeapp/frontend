import React, { useState, useEffect } from 'react';
import '../assets/css/catalogoCuenta.css';
import { FaBroom, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { CiTrash } from "react-icons/ci";
import { show_alerta, show_alerta2 } from '../functions';
import axios from 'axios';
import config from '../config';
import Cookies from 'universal-cookie';

const PlantillaPlanContable = ({ setCurrentComponent }) => {
  const cookies = new Cookies();
  const baseUrl = config.API_BASE_URL;
  const [token] = useState(cookies.get('token'));
  
  // Estados para el formulario
  const [codPPlan, setCodPPlan] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [niveles, setNiveles] = useState('');
  const [longitud, setLongitud] = useState('');
  const [stPlan, setStPlan] = useState('true');
  const [valido, setValido] = useState('false');
  
  // Estados para la lista y operaciones
  const [plantillas, setPlantillas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isSpinnerModifying, setIsSpinnerModifying] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Cargar plantillas al montar el componente
  useEffect(() => {
    fetchPlantillas();

    if(cookies.get('permisologia') != 1){
      setIsDisabled(true);
    }
  }, []);

  const fetchPlantillas = async () => {
    try {
      const response = await axios.get(baseUrl + '/api/plantillas-plan-contable', {
        headers: token ? { Authorization: `${token}` } : {}
      });
      setPlantillas(response.data || []);
    } catch (error) {
      show_alerta('Error al cargar las plantillas', 'error');
    }
  };

  // Filtrar plantillas basado en el término de búsqueda
  const filteredPlantillas = plantillas.filter(plantilla =>
    plantilla.codPPlan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plantilla.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
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
      setSelectedRows(filteredPlantillas.map(item => item.idPPlanContable));
    }
    setSelectAll(!selectAll);
  };

  // Cargar datos para edición
  const loadDataForEdit = (plantilla) => {
    setCodPPlan(plantilla.codPPlan || '');
    setDescripcion(plantilla.descripcion || '');
    setNiveles(plantilla.niveles || '');
    setLongitud(plantilla.longitud || '');
    setStPlan(plantilla.stPlan?.toString() || 'true');
    setValido(plantilla.valido?.toString() || 'false');
    setEditingId(plantilla.idPPlanContable);
  };

  // Limpiar formulario
  const handleClean = () => {
    setCodPPlan('');
    setDescripcion('');
    setNiveles('');
    setLongitud('');
    setStPlan('true');
    setValido('false');
    setEditingId(null);
  };

  // Eliminar plantilla
  const handleDelete = async (id) => {
    const result = await show_alerta2('¿Está seguro de eliminar esta plantilla?', 'warning', true);
    if (!result) return;
    
    try {
      await axios.delete(`${baseUrl}/api/plantillas-plan-contable/${id}`, {
        headers: {
          Authorization: `${token}`
        }
      });
     
      show_alerta('Plantilla eliminada exitosamente', 'success');
      setPlantillas(plantillas.filter(item => item.idPPlanContable !== id));
    } catch (error) {
      show_alerta('Error al eliminar la plantilla', 'error');
    }
  };

  // Eliminar múltiples plantillas
  const handleDeleteMultiple = async () => {
    if (selectedRows.length === 0) {
      show_alerta('Seleccione al menos una plantilla para eliminar', 'warning');
      return;
    }

    const result = await show_alerta2(`¿Está seguro de eliminar ${selectedRows.length} plantilla(s)?`, 'warning', true);
    if (!result) return;

    try {
      for (const id of selectedRows) {
        await axios.delete(`${baseUrl}/api/plantillas-plan-contable/${id}`, {
          headers: {
            Authorization: `${token}`
          }
        });
      }
     
      show_alerta('Plantillas eliminadas exitosamente', 'success');
      setPlantillas(plantillas.filter(item => !selectedRows.includes(item.idPPlanContable)));
      setSelectedRows([]);
      setSelectAll(false);
    } catch (error) {
      show_alerta('Error al eliminar las plantillas', 'error');
    }
  };

  // Enviar formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
   
    if (!codPPlan || !descripcion) {
      show_alerta('Los campos Código y Descripción son obligatorios', 'error');
      return false;
    }
   
    setIsSpinnerModifying(true);
   
    try {
      const formData = {
        codPPlan,
        descripcion,
        niveles,
        longitud,
        stPlan: false, //stPlan === 'true',
        valido: false, //valido === 'true'
      };

      let response;
     
      if (editingId) {
        // Modificar plantilla existente
        response = await axios.put(
          `${baseUrl}/api/plantillas-plan-contable/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Crear nueva plantilla
        response = await axios.post(
          `${baseUrl}/api/plantillas-plan-contable`,
          formData,
          {
            headers: {
              Authorization: `${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
 
      if (response.status === 200 || response.status === 201) {
        show_alerta(editingId ? 'Registro actualizado exitosamente' : 'Registro guardado exitosamente', 'success');
       
        // Actualizar la lista de plantillas
        if (editingId) {
          setPlantillas(plantillas.map(item =>
            item.idPPlanContable === editingId ? { ...item, ...formData } : item
          ));
        } else {
          // Agregar nueva plantilla a la tabla
          setPlantillas([...plantillas, { ...response.data, idPPlanContable: response.data.idPPlanContable }]);
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
      <div id="header-section" className="header" style={{ borderBottom: "0.5px solid #DDD"}}>
        <button className="regresar-button" onClick={() => setCurrentComponent('moduloPlanContable')}>
          <span className="icon">←</span> Regresar
        </button>
        <h2 className="titulo">
          Plantillas de Plan Contable
        </h2>
      </div>

      <div id="form-section" className="form-section" style={{marginTop : "20px"}}>
        <div className="form-row col-12">
          <div className="form-group">
            <label htmlFor="codPPlan">Código</label>
            <input
              type="text"
              id="codPPlan"
              value={codPPlan}
              onChange={(e) => setCodPPlan(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <input
              type="text"
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row col-6">
          <div className="form-group ">
            <label htmlFor="niveles">Niveles</label>
            <input
              type="text"
              id="niveles"
              value={niveles}
              onChange={(e) => setNiveles(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="longitud">Longitud</label>
            <input
              type="text"
              id="longitud"
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
              style={{width:"97%"}}
            />
          </div>
        </div>
      </div>

      {!isDisabled ?
        <div className="actions-section" style={{ marginTop: "20px"}}>
          <button className="clean-button" onClick={handleClean}>
            <FaBroom style={{ marginRight: "0.5rem" }}/> Limpiar
          </button>

          <button
            className="save-button"
            disabled={isSpinnerModifying}
            onClick={handleSubmit}
          >
            {isSpinnerModifying ? (
              <div className="spinner"></div>
            ) : editingId ? (
              "Modificar Plantilla"
            ) : (
              "Guardar Plantilla"
            )}
          </button>
        
          <button className="delete-button" onClick={handleDeleteMultiple}>
            <CiTrash style={{ marginRight: "0.5rem", fontSize: "18px" }}/> Eliminar
          </button>
        </div>
        :''
      }

      <div className="table-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar código o descripción..."
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
                  disabled={isDisabled}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Código</th>
              <th>Descripción</th>
              <th>Niveles</th>
              <th>Longitud</th>
              <th>Estado</th>
              <th>Válido</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlantillas.length > 0 ? (
              filteredPlantillas.map(plantilla => (
                <tr key={plantilla.idPPlanContable}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(plantilla.idPPlanContable)}
                      onChange={() => handleRowSelect(plantilla.idPPlanContable)}
                      disabled={isDisabled}
                    />
                  </td>
                  <td>{plantilla.codPPlan}</td>
                  <td>{plantilla.descripcion}</td>
                  <td>{plantilla.niveles}</td>
                  <td>{plantilla.longitud}</td>
                  <td>{plantilla.stPlan?.toString() === 'true' ? 'Activo' : 'Inactivo'}</td>
                  <td>{plantilla.valido?.toString() === 'true' ? 'Sí' : 'No'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className={`${!isDisabled ? 'edit-btn' : 'bloquear'}`}
                        onClick={() => loadDataForEdit(plantilla)}
                        disabled={isDisabled}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${!isDisabled ? 'delete-btn' : 'bloquear'}`}
                        onClick={() => handleDelete(plantilla.idPPlanContable)}
                        disabled={isDisabled}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>
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
       
        .bloquear{
          border:none !important;
          background:none !important;
          color: #D1D7DDFF
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
       
        .form-group input,
        .form-group select {
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

export default PlantillaPlanContable;