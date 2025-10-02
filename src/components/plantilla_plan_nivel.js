import React, { useState, useEffect } from 'react';
import '../assets/css/catalogoCuenta.css';
import { FaBroom, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { CiTrash } from "react-icons/ci";
import { show_alerta, show_alerta2 } from '../functions';
import axios from 'axios';
import config from '../config';
import Cookies from 'universal-cookie';

const PlantillaPlanNivel = ({ setCurrentComponent }) => {
  const cookies = new Cookies();
  const baseUrl = config.API_BASE_URL;
  const [nivel, setNivel] = useState('');
  const [longitud, setLongitud] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [longitudNivel, setLongitudNivel] = useState('');
  const [userId, setUserId] = useState(cookies.get('idUsuario'));
  const [token, setToken] = useState(cookies.get('token'));
  const [isSpinnerModifying, setIsSpinnerModifying] = useState(false);
  const [isSpinnerAprob, setIsSpinnerAprob] = useState(false);
  const [niveles, setNiveles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [plantillas, setPlantillas] = useState([]);
  const [selectedPlantilla, setSelectedPlantilla] = useState('');
  const [bloquear, setBloquear] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Cargar plantillas de plan contable
  useEffect(() => {
    const fetchData = async () => {
      try {
        const plantillasResponse = await axios.get(baseUrl + '/api/plantillas-plan-contable', {
          headers: token ? { Authorization: `${token}` } : {}
        });
        setPlantillas(plantillasResponse.data || []);
      } catch (error) {
        show_alerta('Error al cargar los datos', 'error');
      }
    };

    if(cookies.get('permisologia') != 1){
      setBloquear(true);
    }

    fetchData();
  }, []);

  // Cargar niveles de una plantilla específica
  const cargarNivelesPlantilla = async (idPPlanContable) => {
    try {
      const response = await axios.get(`${baseUrl}/api/plantilla-plan-nivel/contable/${idPPlanContable}`, {
        headers: token ? { Authorization: `${token}` } : {}
      });
      setNiveles(response.data);
    } catch (error) {
      show_alerta('Error al cargar los niveles de la plantilla', 'error');
    }
  };

  // Manejar cambio de selección en el ComboBox
  const handlePlantillaChange = async (e) => {
    const selectedValue = e.target.value;
    setSelectedPlantilla(selectedValue);
    handleClean();
    if (selectedValue) {
      await cargarNivelesPlantilla(selectedValue);
      var pplan_contable = plantillas.filter(p => p.idPPlanContable == selectedValue);
      if(pplan_contable[0].stPlan){
        setBloquear(true);
        handleClean();
      }else{
        setBloquear(false);
      }
    } else {
      setNiveles([]);
    }
  };

  // Filtrar niveles basado en el término de búsqueda
  const filteredNiveles = niveles.filter(nivelItem =>
    nivelItem.nivel.toString().includes(searchTerm.toLowerCase()) ||
    nivelItem.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
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
      setSelectedRows(filteredNiveles.map(item => item.idPplanNivel));
    }
    setSelectAll(!selectAll);
  };

  // Cargar datos para edición
  const loadDataForEdit = (nivelItem) => {
    setNivel(nivelItem.nivel);
    setLongitud(nivelItem.longitud);
    setDescripcion(nivelItem.descripcion);
    setLongitudNivel(nivelItem.longitudNivel);
    setEditingId(nivelItem.idPplanNivel);

    // Desplazar al formulario
    document.getElementById('header-section').scrollIntoView({ behavior: 'smooth' });
  };

  // Limpiar formulario
  const handleClean = () => {
    setNivel('');
    setLongitud('');
    setDescripcion('');
    setLongitudNivel('');
    setEditingId(null);
  };

  // Eliminar nivel
  const handleDelete = async (id) => {
    const result = await show_alerta2('¿Está seguro de eliminar este nivel?', 'warning', true);
    if (!result) return;

    try {
      await axios.delete(`${baseUrl}/api/plantilla-plan-nivel/${id}`, {
        headers: {
          Authorization: `${token}`
        }
      });

      show_alerta('Nivel eliminado exitosamente', 'success');
      setNiveles(niveles.filter(item => item.idPplanNivel !== id));
    } catch (error) {
      show_alerta('Error al eliminar el nivel', 'error');
    }
  };

  // Eliminar múltiples niveles
  const handleDeleteMultiple = async () => {
    if (selectedRows.length === 0) {
      show_alerta('Seleccione al menos un nivel para eliminar', 'warning');
      return;
    }

    const result = await show_alerta2(`¿Está seguro de eliminar ${selectedRows.length} nivel(es)?`, 'warning', true);
    if (!result) return;

    try {
      for (const id of selectedRows) {
        await axios.delete(`${baseUrl}/api/plantilla-plan-nivel/${id}`, {
          headers: {
            Authorization: `${token}`
          }
        });
      }

      show_alerta('Niveles eliminados exitosamente', 'success');
      setNiveles(niveles.filter(item => !selectedRows.includes(item.idPplanNivel)));
      setSelectedRows([]);
      setSelectAll(false);
    } catch (error) {
      show_alerta('Error al eliminar los niveles', 'error');
    }
  };

  // Enviar formulario
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedPlantilla || !nivel || !longitud || !descripcion || !longitudNivel) {
      show_alerta('Todos los campos son obligatorios', 'error');
      return false;
    }

    setIsSpinnerModifying(true);

    try {
      let formData = {
        idPplanContable: selectedPlantilla,
        nivel: parseInt(nivel),
        longitud: parseInt(longitud),
        descripcion: descripcion,
        longitudNivel: parseInt(longitudNivel)
      };

      let response;

      if (editingId) {
        // Modificar nivel existente
        response = await axios.put(
          `${baseUrl}/api/plantilla-plan-nivel/${editingId}`,
          formData,
          {
            headers: {
              Authorization: `${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Crear nuevo nivel
        response = await axios.post(
          `${baseUrl}/api/plantilla-plan-nivel`,
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

        // Actualizar la lista de niveles
        if (editingId) {
          setNiveles(niveles.map(item =>
            item.idPplanNivel === editingId ? { ...item, ...formData } : item
          ));
        } else {
          // Agregar nuevo nivel a la tabla
          setNiveles([...niveles, response.data]);
        }

        // Limpiar formulario
        handleClean();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        show_alerta(error.response.data, 'error');
      } else {
        show_alerta('Error al guardar el registro', 'error');
      }
    } finally {
      setIsSpinnerModifying(false);
    }
  };

  const handleAprobar = async (event) => {
    event.preventDefault();

    setIsSpinnerAprob(true);

    try {
      let params = {
        idPPlanContable: selectedPlantilla
      };

      var response = await axios.get(
        `${baseUrl}/api/plantilla-plan-nivel/validar-nivel`,
        {
          params: params,
          headers: {
            Authorization: `${token}`,
          }
        }
      );

      if (response.status === 200 && response.data === true) {
        show_alerta('Aprobación realizada exitosamente' , 'success');
        setBloquear(true);
        handleClean();
      }else{
        show_alerta('La estructura de los niveles no tiene un formato correcto' , 'error');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        show_alerta(error.response.data, 'error');
      } else {
        show_alerta('Error al aprobar registro', 'error');
      }
    } finally {
      setIsSpinnerAprob(false);

    }
  };

  return (
    <div className="catalogo-cuenta-container">
      <div id="header-section" className="header" style={{ borderBottom: "0.5px solid #DDD"}}>
        <button className="regresar-button" onClick={() => setCurrentComponent('moduloPlanContable')}>
          <span className="icon">←</span> Regresar
        </button>
        <h2 className="titulo">
          Niveles de Plan Contable
        </h2>
      </div>

      <div id="form-section" className="form-section">
        <div className="form-row top-row"></div>

        <div className="form-group" id="plantilla-plan-contable">
          <label htmlFor="plantilla">Plan Contable</label>
          <select
            id="plantilla"
            value={selectedPlantilla}
            onChange={handlePlantillaChange}
            className="custom-select full-width-select"
            required
          >
            <option value="">Seleccione un plan...</option>
            {plantillas.map(plantilla => (
              <option key={plantilla.idPPlanContable} value={plantilla.idPPlanContable}>
                {plantilla.codPPlan} - {plantilla.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row" style={{marginTop:"15px"}}>
          <div className="form-group">
            <label htmlFor="nivel">Nivel</label>
            <input
              type="number"
              id="nivel"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              required
              min="1"
              max="99"
              disabled={bloquear}
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor="descripcion">Descripción</label>
            <input
              type="text"
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              maxLength={60}
              disabled={bloquear}
            />
          </div>

        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="longitudNivel">Longitud Nivel</label>
            <input
              type="number"
              id="longitudNivel"
              value={longitudNivel}
              onChange={(e) => setLongitudNivel(e.target.value)}
              required
              min="1"
              max="99"
              disabled={bloquear}
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitud">Longitud Total</label>
            <input
              type="number"
              id="longitud"
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
              required
              min="1"
              max="99"
              disabled={bloquear}
            />
          </div>

        </div>
      </div>

      {!bloquear ?
        <div className="actions-section" style={{marginTop: "20px"}}>
          <button
            className="save-button"
            disabled={isSpinnerModifying}
            onClick={handleSubmit}
          >
            {isSpinnerModifying ? (
              <div className="spinner"></div>
            ) : editingId ? (
              "Modificar Nivel"
            ) : (
              "Guardar Nivel"
            )}
          </button>

          <button
            className="aprob-button"
            disabled={isSpinnerAprob}
            onClick={handleAprobar}
          >
            {isSpinnerAprob ? (
              <div className="spinner"></div>
            ) : (
              "Aprobar Estructura"
            )}
          </button>
          
          <button className="clean-button" onClick={handleClean}>
            <FaBroom style={{ marginRight: "0.5rem" }}/> Limpiar
          </button>

          <button className="delete-button" onClick={handleDeleteMultiple}>
            <CiTrash style={{ marginRight: "0.5rem", fontSize: "18px" }}/> Eliminar
          </button>
        </div>
        :
        ''
      }

      <div className="table-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar nivel o descripción..."
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
                  disabled={bloquear}
                />
              </th>
              <th>Nivel</th>
              <th>Descripción</th>
              <th>Longitud Nivel</th>
              <th>Longitud Total</th>              
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredNiveles.length > 0 ? (
              filteredNiveles.map(nivelItem => (
                <tr key={nivelItem.idPplanNivel}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(nivelItem.idPplanNivel)}
                      onChange={() => handleRowSelect(nivelItem.idPplanNivel)}
                      disabled={bloquear}
                    />
                  </td>
                  <td>{nivelItem.nivel}</td>                  
                  <td>{nivelItem.descripcion}</td>
                  <td>{nivelItem.longitudNivel}</td>
                  <td>{nivelItem.longitud}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className={`${!bloquear ? 'edit-btn' : 'bloquear'}`}
                        onClick={() => loadDataForEdit(nivelItem)}
                        disabled={bloquear}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`${!bloquear ? 'delete-btn' : 'bloquear'}`}
                        onClick={() => handleDelete(nivelItem.idPplanNivel)}
                        disabled={bloquear}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                  {selectedPlantilla ? 'No hay niveles para la plantilla seleccionada' : 'Seleccione una plantilla para ver los niveles'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .aprob-button {
          background-color: var(--bs-info-text-emphasis) !important;
          color: #DEB71D !important;
          font-weight: normal !important;
        }

        .bloquear{
          border:none !important;
          background:none !important;
          color: #D1D7DDFF
        }

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
       
        input, .custom-select {
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

        .full-width-select {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default PlantillaPlanNivel;