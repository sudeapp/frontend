import React, { useState,useRef,useEffect } from 'react';
import '../assets/css/registroComprobantes.css'; 
import { FaBroom, FaTimesCircle, FaEdit, FaPencilAlt, FaTrash, FaToggleOn, FaToggleOff  } from 'react-icons/fa';
import { CiImport, CiTrash,CiExport} from "react-icons/ci";
import { show_alerta } from '../functions';
import axios from 'axios';
import config from '../config';
import Cookies from 'universal-cookie';

const RegistroComprobantes = ({ setCurrentComponent,comprobanteSeleccionado,setIsParamsConsultingUpdate,isParamsConsultingUpdate }) => {
  const cookies = new Cookies();
  const baseUrl = config.API_BASE_URL;
  const [fechaValor, setFechaValor] = useState('');
  const [cuenta, setCuenta] = useState('');
  const [auxiliar, setAuxiliar] = useState('');
  const [nroAuxiliar, setNroAuxiliar] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const [isConsulting, setIsConsulting] = useState(false);
  const [isDisabledAux, setIsDisabledAux] = useState(true);
  const [tipoCuenta, setTipoCuenta] = useState(''); // 'Debito' o 'Credito'
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [descripcionLength, setDescripcionLength] = useState(0);
  const [nombreCuenta, setNombreCuenta] = useState('');
  const [planCatalogo, setPlanCatalogo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingFecha, setIsSearchingFecha] = useState(false);
  const [isSearchingAux, setIsSearchingAux] = useState(false);
  const [nombreAux, setNombreAux] = useState('');
  const [nextNumero, setNextNumero] = useState(3); 
  const [userId, setUserId] = useState(cookies.get('idUsuario')); 
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho')); 
  const [idPlanContable, setIdPlanContable] = useState(cookies.get('idPlanContable')); 
  const [idTcbte, setIdTcbte] = useState(1);
  const [isSpinnerModifying, setIsSpinnerModifying] = useState(false);
  const [isBloqueado, setIsBloqueado] = useState(false);
  const [isHideButton, setIsHideButton] = useState(false);

  // Estado para los datos de la tabla
  const [comprobantes, setComprobantes] = useState([
    // Ejemplo de datos
    //{ numero: '000001', cuenta: '12345678', auxiliar: '98765432', descripcion: 'Pago de servicios', debito: '100.00', credito: '' },
  ]);
  const [selectedItems, setSelectedItems] = useState([]);
  const cuentaInputRef = useRef(null);
  const MAX_DESCRIPCION_LENGTH = 255;
  useEffect(() => {
    if(cookies.get('permisologia') != 2 && cookies.get('permisologia') != 4 && cookies.get('permisologia') != 5){
      //setIsBloqueado(true);
      handleLocked();
    }
  }, []);

  
  useEffect(() => {
    if (comprobanteSeleccionado) {
      cargarDatosComprobante(comprobanteSeleccionado);
      if((cookies.get('permisologia') != 2 && cookies.get('permisologia') != 4 && cookies.get('permisologia') != 5) || comprobanteSeleccionado.estatusCbte == 2 || comprobanteSeleccionado.estatusCbte == 3){
        //setIsBloqueado(true);
        handleLocked();
        setIsDisabled(true);
        setIsHideButton(true);
      }
    } 
  }, [comprobanteSeleccionado]);
  
  // Función para manejar selección/deselección de items
  const handleSelectItem = (numero) => {
    if (selectedItems.includes(numero)) {
      setSelectedItems(selectedItems.filter(item => item !== numero));
    } else {
      setSelectedItems([...selectedItems, numero]);
    }
  };

  // Función para seleccionar/deseleccionar todos
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(comprobantes.map(item => item.numero));
    } else {
      setSelectedItems([]);
    }
  };
  
  const handleDescripcionChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPCION_LENGTH) {
      setDescripcion(value);
      setDescripcionLength(value.length);
    }
  };

  const handleLimpiar = () => {
    setFechaValor('');
    setCuenta('');
    setAuxiliar('');
    setNroAuxiliar('');
    setPlanCatalogo('');
    setTipoCuenta('');
    setMonto('');
    setDescripcion('');
    setDescripcionLength(0);
    setIsDisabled(true);
    // No limpia la tabla automáticamente en este caso, solo los campos de entrada
  };

  const handleEliminarSeleccionados = () => {
    if (selectedItems.length === 0) {
      show_alerta("Seleccione al menos un comprobante para eliminar", "warning");
      return;
    }

    // Filtrar los comprobantes, excluyendo los seleccionados
    const nuevosComprobantes = comprobantes.filter(
      item => !selectedItems.includes(item.numero)
    );
    
    setComprobantes(nuevosComprobantes);
    setSelectedItems([]);
    show_alerta(`${selectedItems.length} comprobante(s) eliminado(s)`, "success");
  };

  const handleExportarExcel = () => {
    // Lógica para exportar la tabla a Excel
    console.log('Exportando a Excel...');
  };

  const handleChangeComponent = (currents) => {
    setCurrentComponent(currents);
  };

  //Buscar Cuenta 
  const buscarCuentaPorAPI = async () => {
    if (!cuenta) {
      show_alerta("Por favor, ingrese un número de cuenta", "warning");
      return;
    }

    try {
      console.log("idPlanContable",idPlanContable)
      setIsSearching(true);
      const response = await axios.get(`${baseUrl}/api/comprobante/buscar-cuenta`, {
        params: {
          cuenta:cuenta,
          idPlanContable:idPlanContable
        }
      });

      const data = response.data;
      if (data.status === "success" && data.data) {
        setNombreCuenta(data.data.descripcion);
        setPlanCatalogo(data.data);
        if(data.data.idTaux){
          setIsDisabledAux(false);
        }else{
           setIsDisabledAux(true);
        }
       
        //show_alerta("Descripción de cuenta cargada exitosamente", "success");
      } else {
        show_alerta(data.message || "No se encontró la cuenta", "error");
        setNombreCuenta('');
        setPlanCatalogo('');
      }
    } catch (error) {
      // Manejar errores de la petición (ej. el servidor no está corriendo)
      console.error("Error en la conexión con la API:", error);
      show_alerta("No se pudo conectar con la API. Intente de nuevo más tarde.", "error");
      setNombreCuenta(''); 
      setPlanCatalogo('');
    }finally{
      setIsSearching(false);
    }
  };

  //Buscar Ax
  const buscarAux = async () => {
    if (!nroAuxiliar) {
      show_alerta("Por favor, ingrese código de auxiliar", "warning");
      return;
    }

    try {
      setIsSearchingAux(true);
      const response = await axios.get(`${baseUrl}/api/comprobante/buscar-auxiliar`, {
        params: {
          codigo:nroAuxiliar
        }
      });

      const data = response.data;
      if (data.status === "success" && data.data) {
        setNombreAux(data.data.descAuxi);
        setAuxiliar(data.data);
      } else {
        show_alerta(data.message || "No se encontró el auxiliar", "error");
        setNombreAux('');
        setAuxiliar('');
      }
    } catch (error) {
      // Manejar errores de la petición (ej. el servidor no está corriendo)
      console.error("Error en la conexión con la API:", error);
      show_alerta("No se pudo conectar con la API. Intente de nuevo más tarde.", "error");
      setNombreAux(''); 
      setAuxiliar('');
    }finally{
      setIsSearchingAux(false);
    }
  };

   //Valida fecha valor
  const validarFechaValor = async () => {
    if (!fechaValor) {
      show_alerta("Por favor, ingrese una fecha valor", "warning");
      return;
    }

    try {
      console.log("fechaValor",fechaValor)
      setIsSearchingFecha(true);
      const response = await axios.get(`${baseUrl}/api/comprobante/fecha-valor`, {
        params: {
          idCaho:idCaho, 
          fechaValor:fechaValor
        }
      });

      const data = response.data;
      console.log("fechaValor 2",data)
      if (data.status === "success" && data.data) {
        setIsDisabled(false);

        // Enfocar el campo de cuenta 
        setTimeout(() => {
          if (cuentaInputRef.current) {
            cuentaInputRef.current.focus();
          }
        }, 100);
      } else {
        show_alerta("Fecha no valida", "error");
        setNombreCuenta('');
        setNombreAux('');
        setIsDisabled(true);
        setIsDisabledAux(true);
      }
    } catch (error) {
      // Manejar errores de la petición (ej. el servidor no está corriendo)
      console.error("Error en la conexión con la API:", error);
      show_alerta("No se pudo conectar con la API. Intente de nuevo más tarde.", "error");
      setNombreCuenta(''); 
    }finally{
      setIsSearchingFecha(false);
    }
  };
  
  // Función para agregar items a la tabla
  const handleAgregarItem = () => {
    // Validar campos obligatorios
    if (!cuenta || !tipoCuenta || !monto || !descripcion) {
      show_alerta("Cuenta, tipo de cuenta, descripción y monto son obligatorios", "warning");
      return;
    }

    // Crear nuevo comprobante
    const nuevoComprobante = {
      numero: nextNumero.toString().padStart(6, '0'),
      cuenta: cuenta,
      nroAuxiliar: nroAuxiliar || '-',
      descripcion: descripcion || '-',
      //debito: tipoCuenta === 'Debito' ? parseFloat(monto).toFixed(2) : '',
      //credito: tipoCuenta === 'Credito' ? parseFloat(monto).toFixed(2) : '',

      debito: tipoCuenta === 'Debito' ? formatCurrency(monto) : '',
      credito: tipoCuenta === 'Credito' ? formatCurrency(monto) : '',
      planCatalogo:planCatalogo,
      auxiliar:auxiliar
    };

    // Agregar a la tabla
    setComprobantes([...comprobantes, nuevoComprobante]);
    setNextNumero(nextNumero + 1);
    
    // Limpiar campos (excepto fecha)
    setCuenta('');
    setNroAuxiliar('');
    setAuxiliar('');
    setPlanCatalogo('');
    setTipoCuenta('');
    setMonto('');
    setDescripcion('');
    setDescripcionLength(0);
    setNombreCuenta('');
    setNombreAux('');
    setIsDisabledAux(true);
  };
  
  const handleGuardar = async () => {
    // Validar que haya al menos un detalle
    if (comprobantes.length === 0) {
      show_alerta("Debe agregar al menos un item al comprobante", "warning");
      return;
    }
  
    setIsSpinnerModifying(true);
    // Validar que la diferencia sea cero (débitos = créditos)
    /*if (calcularDiferencia() !== "0.00") {
      show_alerta("Los totales de débito y crédito no coinciden", "warning");
      return;
    }*/
  
    // Construir payload para el comprobante
    const payload = {
      idCaho: idCaho,
      idTcbte: idTcbte,
      idUsuarioCreacion: userId,
      //nroCbte: parseInt(Date.now().toString().slice(-12), 10), // Valor fijo (debería ser generado automáticamente)
      nroCbte:null,
      fechaCbte: fechaValor,
      periodo: null, 
      fechaCreacion: new Date().toISOString().split('T')[0], // Fecha actual
      estatusCbte: 0, // 0 = cargado
      comprobanteDet: comprobantes.map((item, index) => ({
        idPlanContable: idPlanContable, 
        idPlanCatalogo: item.planCatalogo.idPlanCatalogo, 
        idAuxi: item.auxiliar ? item.auxiliar.idAuxi : null, 
        dbcr: item.debito ? "D" : "C", // Determinar si es débito o crédito
        bsMonto: parseCurrency(item.debito || item.credito), // Convertir a número
        descripcion: item.descripcion,
        linea: index + 1, // Numeración secuencial
        tplan: 1 // Tipo de plan (valor fijo)
      }))
    };
   
    try {
      const response = await axios.post(
        `${baseUrl}/api/comprobante/save`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data && response.data.status === "success") {
        show_alerta("Comprobante guardado con éxito", "success");
        // Limpiar formulario después de guardar
        handleLimpiar();
        setComprobantes([]);
        setNextNumero(1);
      } else {
        show_alerta(response.data?.message || "Error al guardar el comprobante", "error");
      }
    } catch (error) {
      console.error("Error al guardar comprobante:", error);
      show_alerta(
        error.response?.data?.message || 
        "Error en la conexión con el servidor", 
        "error"
      );
    }finally{
      setIsSpinnerModifying(false);
    }
  };

  //** EDICIÖN **//
  const handleModificar = async () => {
    if (comprobantes.length === 0) {
      show_alerta("Debe agregar al menos un item al comprobante", "warning");
      return;
    }
  
    setIsSpinnerModifying(true);
    /*const diferencia = calcularDiferencia();
    if (diferencia !== "0.00") {
      show_alerta(`Los totales no coinciden (diferencia: ${diferencia})`, "warning");
      return;
    }*/
    // Construir payload
    const payload = {
      fechaCbte: fechaValor,
      periodo: null,
      estatusCbte: 0,
      comprobanteDet: comprobantes.map((item, index) => {
        const detalle = {
          id: item.detalleOriginal?.id || null, // Mantener ID para detalles existentes
          idPlanContable: idPlanContable,
          //planCatalogo: item.planCatalogo, 
          //auxiliar: item.auxiliar, 
          idPlanCatalogo:item.planCatalogo?.idPlanCatalogo,
          idAuxi:item.auxiliar?.idAuxi, 
          dbcr: item.debito ? "D" : "C",
          bsMonto: parseCurrency(item.debito || item.credito),
          descripcion: item.descripcion,
          linea: index + 1,
          tplan: 1
        };
                
        return detalle;
      })
    };
   
    try {
      const response = await axios.put(
        `${baseUrl}/api/comprobante/${comprobanteSeleccionado.id}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      
      if (response.data.status === "success") {
        show_alerta("Comprobante modificado con éxito", "success");
        
        // 6. Valida el origen del comprobante (si proviene de una consulta o módulo de cont.)
        console.log("comprobanteSeleccionado",comprobanteSeleccionado);
        if(!comprobanteSeleccionado.isConsulting){
          setCurrentComponent('moduloContabilidad');
          return;
        }
        // Redirigir a consulta
        const paramsUpdate = {
          update: 1,
          idCaho:isParamsConsultingUpdate.idCaho,
          startDate: isParamsConsultingUpdate.startDate,
          endDate: isParamsConsultingUpdate.endDate,
          numeroComprobante: isParamsConsultingUpdate.numeroComprobante,
          usuarioBusqueda: isParamsConsultingUpdate.usuarioBusqueda,
          idEstatus: isParamsConsultingUpdate.estatusBusqueda,
          screamConsultingComprobante:isParamsConsultingUpdate.screamConsultingComprobante
        };
        setIsParamsConsultingUpdate(paramsUpdate);

        if(isParamsConsultingUpdate.screamConsultingComprobante == 1){
          setCurrentComponent('consultaComprobantes');
        }else{
          setCurrentComponent('consultaComprobanteAprobacion');
        }
        
      } else {
        show_alerta(response.data.message || "Error al modificar", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      show_alerta(
        error.response?.data?.message || 
        "Error en conexión con servidor", 
        "error"
      );
    }finally{
      setIsSpinnerModifying(false);
    }
  };
  
  // Función mejorada para parsear montos
  const parseCurrency = (value) => {
    if (!value) return 0;
    
    // Remover puntos de miles y convertir coma decimal a punto
    const cleanValue = value.toString()
      .replace(/\./g, '')
      .replace(',', '.');
    
    return parseFloat(cleanValue);
  };
  
  // Calcular diferencia con formato correcto
  const calcularDiferencia = () => {
    let totalDebitos = 0;
    let totalCreditos = 0;
  
    comprobantes.forEach(item => {
      if (item.debito) totalDebitos += parseCurrency(item.debito);
      if (item.credito) totalCreditos += parseCurrency(item.credito);
    });
  
    const diferencia = totalDebitos - totalCreditos;
    return diferencia.toFixed(2);
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

  const cargarDatosComprobante = (comprobante) => {
    // 1. Establecer datos principales
    setIsConsulting(true);
    setFechaValor(comprobante.fechaCbte.split('T')[0]);
    // 2. Transformar detalles al formato de la tabla
    const comprobantesFormateados = comprobante.comprobanteDet.map(detalle => ({
      numero: detalle.linea.toString().padStart(6, '0'),
      cuenta: detalle.planCatalogo?.cuenta.toString() || 'N/A',
      nroAuxiliar: detalle.auxiliar?.codAuxi || 'N/A',
      descripcion: detalle.descripcion,
      debito: detalle.dbcr === 'D' ? formatCurrency(detalle.bsMonto) : '',
      credito: detalle.dbcr === 'C' ? formatCurrency(detalle.bsMonto) : '',
      planCatalogo:detalle.planCatalogo,
      auxiliar: detalle.auxiliar,
      detalleOriginal: detalle
    }));

    // 3. Actualizar estados
    setComprobantes(comprobantesFormateados);
    setNextNumero(comprobante.comprobanteDet.length + 1);
    
    // 4. Habilitar campos
    setIsDisabled(false);
    
    // 5. Mostrar mensaje
    //show_alerta(`Comprobante ${comprobante.nroCbte} cargado`, "success");
    show_alerta(`Comprobante cargado`, "success");
  };

  const handleRegresar = () => {
    
    // 6. Valida el origen del comprobante (si proviene de una consulta o módulo de cont.)
    if(comprobanteSeleccionado != null && !comprobanteSeleccionado.isConsulting){
      setCurrentComponent('moduloContabilidad');
      return;
    }

    if (isConsulting){
      const paramsUpdate = {
        update:1,
        idCaho:isParamsConsultingUpdate.idCaho,
        startDate:isParamsConsultingUpdate.startDate,
        endDate:isParamsConsultingUpdate.endDate,
        numeroComprobante:isParamsConsultingUpdate.numeroComprobante,
        usuarioBusqueda:isParamsConsultingUpdate.usuarioBusqueda,
        idEstatus: isParamsConsultingUpdate.idEstatus,
        screamConsultingComprobante:isParamsConsultingUpdate.screamConsultingComprobante
      }
      setIsParamsConsultingUpdate(paramsUpdate);
      if(isParamsConsultingUpdate.screamConsultingComprobante == 1){
        setCurrentComponent('consultaComprobantes');
      }else{
        setCurrentComponent('consultaComprobanteAprobacion');
      }
      
    }else{
      setCurrentComponent('moduloContabilidad');
    }
  };

  const handleLocked = () => {
    var blockElement = document.querySelector('#registro-comprobantes');
    const inputs = blockElement.querySelectorAll('input');
    const checkboxs = blockElement.querySelectorAll('input[type="checkbox"]');
    const buttons = blockElement.querySelectorAll('button');
    const textareas = blockElement.querySelectorAll('textarea');
    const buttonReturn = blockElement.querySelector('#button-return');
    
    textareas.forEach(textarea => textarea.disabled = true);
    inputs.forEach(input => input.disabled = true);
    checkboxs.forEach(checkbox => checkbox.disabled = true);
    buttons.forEach(button => button.disabled = true);
    buttonReturn.disabled = false;
    blockElement.classList.add('disabled-block');
  };

  // Función para calcular el total de débitos
  const calcularTotalDebito = () => {
    let total = 0;
    comprobantes.forEach(item => {
      if (item.debito) {
        total += parseCurrency(item.debito);
      }
    });
    return formatCurrency(total);
  };

  // Función para calcular el total de créditos
  const calcularTotalCredito = () => {
    let total = 0;
    comprobantes.forEach(item => {
      if (item.credito) {
        total += parseCurrency(item.credito);
      }
    });
    return formatCurrency(total);
  };
  return (
    <div className="registro-comprobantes-container" id="registro-comprobantes">
      {isBloqueado ? (
        <div className="bloqueado-message">
          <h2>Acceso Restringido</h2>
          <p>No tiene permisos para acceder a esta funcionalidad.</p>
        </div>
      ) : (
      <>
        <div className="header">
          <button className="regresar-button" onClick={() => handleRegresar()} id='button-return'>
            <span className="icon">←</span> Regresar
          </button>
          <h2 className="titulo">
            {isConsulting == false ?            
              "Registro de Comprobantes"
              :
              "Modificar Comprobante"
            }
          </h2>
        </div>

        <div className="form-section">
          <div className="form-row top-row" style={{borderBottom: "0.5px solid #ddd",paddingBottom: "20px"}}>
            <div className="form-group fecha-valor">
              <label htmlFor="fechaValor" style={{ fontWeight: "600",color: "#000"}}>Fecha Valor</label>
              <div className="input-with-icon">
                <input
                  type="date"
                  id="fechaValor"
                  placeholder="DD/MM/YYYY"
                  //value={fechaValor}
                  value={fechaValor.split('/').reverse().join('-')}
                  onChange={(e) => setFechaValor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Tab') {
                      validarFechaValor();
                    }
                  }}
                  /*onBlur={(e) => {
                    if (e.key === 'Enter') {
                      validarFechaValor();
                    }
                  }}
                */
                />
                <span className="icon">{isSearchingFecha ? <div className="mini-spinner"></div> : '📅'}</span>
              </div>
            </div>
            <div className="acciones-top">
              {isConsulting == false ? 
                <button className="clean-button" onClick={handleLimpiar}>
                  <FaBroom style={{ marginRight: "0.5rem" }}/> Limpiar
                </button> 
                :
                ""
              }

              {isConsulting == false ? 
                <button className="import-button">
                  <CiImport  style={{ marginRight: "0.5rem",fontSize: "18px" }}/>  Importar
                </button>            
                :
                ""
              }

              {!isHideButton ?
                <button 
                  className="save-button" 
                  onClick={isConsulting ? handleModificar : handleGuardar}
                  disabled={isSpinnerModifying} // Deshabilitar durante la modificación
                >
                  {isConsulting ? 
                    (isSpinnerModifying ? (
                      <div className="spinner"></div>  // Mostrar spinner durante modificación
                    ) : (
                      "Modificar Comprobante"
                    )) 
                    : 
                    (isSpinnerModifying ? (
                      <div className="spinner"></div>  // Mostrar spinner durante modificación
                    ) : (
                      "Guardar Comprobante"
                    )) 
                  }
                </button>
                : ''
              }
              
              {isConsulting == false ?            
                <button className="new-voucher-button">Nuevo Comprobante</button>
                :
                ""
              }
              {/*<button className="review-button">Enviar al Supervisor</button>*/}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group auxiliar">
              <label htmlFor="cuenta">Cuenta</label>
              <div className="input-with-search">
                <input
                  type="text"
                  id="cuenta"
                  value={cuenta}
                  onChange={(e) => setCuenta(e.target.value)}
                  disabled={isDisabled}
                  ref={cuentaInputRef}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Tab') {
                      buscarCuentaPorAPI();
                    }
                  }}
                />
                <button className="search-button" disabled={isSearching} onClick={buscarCuentaPorAPI}>{isSearching ? <div className="mini-spinner"></div> : '🔍'}</button>

              </div>
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="cuenta">Descripción</label>
              <div className="input-with-search">
                <input
                  type="text"
                  id="nombreCuenta"
                  value={nombreCuenta}
                  disabled="true"
                  style={{maxWidth: "44rem"}}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group auxiliar">
              <label htmlFor="auxiliar">Auxiliar</label>
              <div className="input-with-search">
                <input
                  type="text"
                  id="auxiliar"
                  value={nroAuxiliar}
                  onChange={(e) => setNroAuxiliar(e.target.value)}
                  disabled={isDisabledAux}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Tab') {
                      buscarAux();
                    }
                  }}
                />
                <button className="search-button" disabled={isDisabledAux} onClick={buscarAux}>{isSearchingAux ? <div className="mini-spinner"></div> : '🔍'}</button>
              </div>
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="nombreAux">Nombre</label>
              <div className="input-with-search">
                <input
                  type="text"
                  id="nombreAux"
                  value={nombreAux}
                  disabled="true"
                />
              </div>
            </div>
            <div className="form-group tipo-cuenta">
              <label>Tipo de Cuenta</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="radio"
                    name="tipoCuenta"
                    value="Debito"
                    checked={tipoCuenta === 'Debito'}
                    onChange={(e) => setTipoCuenta(e.target.value)}
                    disabled={isDisabled}
                  />{' '}
                  Débito
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipoCuenta"
                    value="Credito"
                    checked={tipoCuenta === 'Credito'}
                    onChange={(e) => setTipoCuenta(e.target.value)}
                    disabled={isDisabled}
                  />{' '}
                  Crédito
                </label>
              </div>
            </div>

            {/*<div className="form-group monto">
              <label htmlFor="monto">Monto</label>
              <input
                type="number"
                id="monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                disabled={isDisabled}
              />
                </div>*/}
              <div className="form-group monto">
                <label htmlFor="monto">Monto</label>
                <input
                  type="number"
                  id="monto"
                  value={monto}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Validar que sea positivo
                    if (value === '' || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
                      setMonto(value);
                    }
                  }}
                  min="0"
                  step="0.01"
                  disabled={isDisabled}
                  placeholder="0.00"
                  onKeyDown={(e) => {
                    // Prevenir teclas de negativo
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
          </div>

          <div className="form-row description-row">
            <div className="form-group full-width">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                rows="4"
                value={descripcion}
                onChange={handleDescripcionChange}
                maxLength={MAX_DESCRIPCION_LENGTH}
                disabled={isDisabled}
              ></textarea>
              <span className="char-count">{descripcionLength}/{MAX_DESCRIPCION_LENGTH}</span>
            </div>
          </div>
        </div>
        {!isHideButton ?
          <div className="actions-section">
            <button className="save-button" onClick={handleAgregarItem} disabled={isDisabled}>Agregar Items</button>
            <button className="delete-button" onClick={handleEliminarSeleccionados}>
              <CiTrash style={{ marginRight: "0.5rem",fontSize: "18px" }}/> Eliminar
            </button>
            <button className="export-excel-button" onClick={handleExportarExcel} disabled={isDisabled}>
              <CiExport style={{ marginRight: "0.5rem",fontSize: "18px" }}/> Exportar a Excel
            </button>
          </div>
          : ''
        }
      </>
      )}
      <div className="table-section">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Cuenta</th>
              <th>Auxiliar</th>
              <th>Descripción</th>
              <th>Débitos</th>
              <th>Créditos</th>
              <th>
                <input 
                  type="checkbox"
                  checked={selectedItems.length === comprobantes.length && comprobantes.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {comprobantes.map((item, index) => (
              <tr key={index}>
                <td>{item.numero}</td>
                <td>{item.cuenta}</td>
                <td>{item.nroAuxiliar}</td>
                <td>{item.descripcion}</td>
                <td>{item.debito}</td>
                <td>{item.credito}</td>
                <td>
                  <input 
                    type="checkbox"
                    checked={selectedItems.includes(item.numero)}
                    onChange={() => handleSelectItem(item.numero)}
                  />
                </td>
              </tr>
            ))}
          
            {/* Rellenar con filas vacías si hay menos de 10 para mantener la altura */}
            {Array.from({ length: Math.max(0, 10 - comprobantes.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>
                  <input type="checkbox" disabled />
                </td>
              </tr>
            ))}
              {/* Fila de totales */}
              {comprobantes.length > 0 && (
              <tr className="total-row">
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  TOTALES:
                </td>
                <td style={{ fontWeight: 'bold' }}>
                  {calcularTotalDebito()}
                </td>
                <td style={{ fontWeight: 'bold' }}>
                  {calcularTotalCredito()}
                </td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination">{/*1 / 20 &gt;*/}</div>
        <div className="total-difference">
          <span>Diferencia</span>
          <input type="text" value={calcularDiferencia()} readOnly />
        </div>
      </div>
    </div>
  );
};

export default RegistroComprobantes;