import React, { useState,useEffect } from 'react';
import '../assets/css/dashboardCaja.css';
import Cookies from 'universal-cookie';
import { show_alerta } from '../functions';
import axios from 'axios';
import config from '../config';

function formatDateTime(isoString) {
  // Convertir a objeto Date
  const date = new Date(isoString);
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  // Crear formateador con opciones deseadas
  const formatter = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false  // Formato 24 horas
  });

  return formatter.format(date);
}

const DashboardComponent = () => {
  const baseUrl = config.API_BASE_URL;
  const cookies = new Cookies();

  const [currentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(3); // Abril = 3 (0-indexed)
  const [selectedYear] = useState(2025);
  const [usuario ] = useState(cookies.get('email'));
  const [idCaho, setIdCaho] = useState(cookies.get('id_caho'));
  const [token, setToken] = useState(cookies.get('token'));
  const [nombreCaho, setNombreCaho] = useState(cookies.get('nombreCaho'));
  const [nombreRol, setNombreRol] = useState(cookies.get('nombreRol'));
  const [recentMovements, setRecentMovements] = useState([]);

  
  // Datos de ejemplo para la agenda
  const agendaItems = [
    { id: 1, title: "Cierre Contable", date: "17 de Febrero 2025", color: "purple" },
    { id: 2, title: "Cierre Contable", date: "17 de Febrero 2025", color: "green" },
    { id: 3, title: "Cierre Contable", date: "17 de Febrero 2025", color: "green" },
    { id: 4, title: "Cierre Contable", date: "17 de Febrero 2025", color: "blue" },
    { id: 5, title: "Cierre Contable", date: "17 de Febrero 2025", color: "blue" },
    { id: 6, title: "Cierre Contable", date: "17 de Febrero 2025", color: "orange" }
  ];

  useEffect(() => {
    handleConsultar();
  }, []);

  const handleConsultar = async () => {
    console.log(handleConsultar);
    try {
      const response = await axios.get(`${baseUrl}/api/cajas-ahorro/ultimos-movimientos`, {
        params: {
          idCaho: idCaho,
          dias: 5
        },
        headers: token ? { Authorization: `${token}` } : {}
      });
      console.log(response)
      if (response.data.data && response.data.data.length > 0) {
        console.log("ultimos-movimientos",response.data.data);
        cargarDatosComprobante(response.data.data);
      } else {
        //show_alerta("No se encontraron resultados", "info");
      }
    } catch (err) {
      console.error('Error al consultar estado res:', err);
      //show_alerta("Error al consultar datos de estado resultado", "error");
    } finally {

    }
  };

  const cargarDatosComprobante = (movimientos) => {
    // Limitar a 7 registros y transformar
    const _recentMovements = movimientos
      .slice(0, 7)  // <--- Aquí aplicamos el límite
      .map(detalle => ({
        date: detalle.fechaCreacion,
        description: `${detalle.usuario} ha creado un nuevo comprobante N. ${detalle.idCbte}`
      }));
  
    setRecentMovements(_recentMovements);
  }
  // Datos de ejemplo para movimientos recientes
  /*const recentMovements = [
    {
      date: "17 de Febrero 2025",
      description: "Alexander Guzman ha creado un nuevo comprobante N. 000000000 a las 15:00 hrs"
    }
  ];*/

  // Obtener días del mes
  const getDaysInMonth = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isHighlighted: false
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isHighlighted: day === 7 || day === 17
      });
    }
    
    // Días del próximo mes para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isHighlighted: false
      });
    }
    
    return days;
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const days = getDaysInMonth(selectedMonth, selectedYear);

  const formatCurrentDate = () => {
    const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    return currentDate.toLocaleDateString('es-ES', options);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="main-title">
            Bienvenido al Sistema Administrativo, Contable y Financiero para las Cajas de Ahorro
          </h1>
          <p className="current-date">{formatCurrentDate()}</p>
          <div className="welcome-section">
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="user-details">{ usuario } / { nombreRol }</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="main-content">
          {/* Calendar Section */}
          <div className="calendar-section">
            <div className="calendar-header">
              <button className="nav-button">❮</button>
              <h3 className="calendar-title">{monthNames[selectedMonth]} {selectedYear}</h3>
              <button className="nav-button">❯</button>
            </div>
            
            <div className="calendar">
              <div className="calendar-grid">
                {dayNames.map(day => (
                  <div key={day} className="day-header">{day}</div>
                ))}
                {days.map((dayObj, index) => (
                  <div 
                    key={index} 
                    className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${dayObj.isHighlighted ? 'highlighted' : ''}`}
                  >
                    {dayObj.day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agenda Section */}
          <div className="agenda-section">
            <h3 className="agenda-title">📅 Agenda Mensual</h3>
            <div className="agenda-list">
              {agendaItems.map(item => (
                <div key={item.id} className="agenda-item">
                  <div className={`agenda-color ${item.color}`}></div>
                  <div className="agenda-content">
                    <span className="agenda-item-title">{item.title}</span>
                    <span className="agenda-item-date">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Movements */}
        <div className="movements-section">
          <div className="movements-header">
            <h3 className="movements-title">Movimientos Recientes</h3>
            <a href="#" className="movements-link">Ir al histórico de movimientos</a>
          </div>
          
          <div className="movements-table">
            <table>
              <tbody>
                {recentMovements.map((movement, index) => (
                  <tr key={index}>
                    <td className="movement-date">{formatDateTime(movement.date)}</td>
                    <td className="movement-description">{movement.description}</td>
                    <td className="movement-action">
                      <button className="view-button">👁</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;