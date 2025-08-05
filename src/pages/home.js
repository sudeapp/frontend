import React, { useEffect, useState } from 'react';
import { FaBars, FaUser, FaHome, FaChartBar, FaCog, FaSignOutAlt,FaChartLine,FaShareAlt,FaPoll,FaToolbox } from 'react-icons/fa';
import logoImage from '../assets/img/logo.png';
import '../assets/css/home.css';
import Cookies from 'universal-cookie';
import ModuloContabilidad from '../components/modulo_contabilidad';
import CajaAhorro from '../components/caja_ahorro_component';
import RegistroComprobantes from '../components/registro_comprobante';
import ConsultaComprobantes from '../components/consulta_comprobante';
import ConsultaComprobanteAprobacion from '../components/consulta_comprobante_aprobacion';
import RegistroUsuarios from '../components/usuario_caja_component';
import UsuariosSudeca from '../components/usuario_sudeca_component';
import DashboardComponent from '../components/dashboard_component';
import DashboardCaja from '../components/dashboard_caja_component';
import Informe from '../components/informe_component';
import LibroDiario from '../components/libro_diario_component';
import ListadoComprobante from '../components/listado_comprobante_component';
import EstadoResultado from '../components/rpt_estado_resultado';
import ConsultaVpc from '../components/consulta_vpc';
import { FaBoxArchive } from 'react-icons/fa6';

const Home = () => {
  const cookies = new Cookies();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentComponent, setCurrentComponent] = useState('');
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);
  const [isParamsConsultingUpdate, setIsParamsConsultingUpdate] = useState(null);
  const [usuarioCaja, setUsuarioCaja] = useState(cookies.get('usuario_caja'));


  useEffect(() => {
    if(!cookies.get('idUsuario')) {
      window.location.href = "./";
    }
    
    if (usuarioCaja !== 1 ){
      setCurrentComponent('dashboardCaja')
    }

    if (usuarioCaja == 1 ){
      setCurrentComponent('dashboard')
    }
  }, []);
/*
  <li className="nav-item">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentComponent('registroComprobantes');
                }} 
                className={`nav-link ${currentComponent === 'registroComprobantes' ? 'active' : ''}`}
              >
                <FaHome className="me-2" /> Caja Ahorro
              </a>
            </li>
*/
  const closeSesion = () => {
    cookies.remove('idUsuario', {path: "/"});
    cookies.remove('usuario', {path: "/"});
    cookies.remove('apellido', {path: "/"});
    cookies.remove('nombre', {path: "/"});
    window.location.href='./';
  }

  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderComponent = () => {
    switch(currentComponent) {
      case 'dashboardCaja':
          return <DashboardCaja 
                          setCurrentComponent={setCurrentComponent}/>;  
      case 'dashboard':
          return <DashboardComponent 
                          setCurrentComponent={setCurrentComponent}/>;        
      case 'moduloContabilidad':
        return <ModuloContabilidad setCurrentComponent={setCurrentComponent}/>;
      case 'informe':
        return <Informe setCurrentComponent={setCurrentComponent}/>;
      case 'cajaAhorro':
        return <CajaAhorro />;
      case 'usuarioSudeca':
          return <UsuariosSudeca />;
      case 'registroComprobantes':
          return <RegistroComprobantes 
                          setCurrentComponent={setCurrentComponent} 
                          comprobanteSeleccionado={null}
                          setIsParamsConsultingUpdate={null}
                          isParamsConsultingUpdate={null}/>;
      case 'consultaComprobantes':
            return <ConsultaComprobantes 
                          setCurrentComponent={setCurrentComponent}
                          setComprobanteSeleccionado={setComprobanteSeleccionado}
                          setIsParamsConsultingUpdate={setIsParamsConsultingUpdate}
                          isParamsConsultingUpdate={isParamsConsultingUpdate}/>;
      case 'consultaComprobanteAprobacion':
            return <ConsultaComprobanteAprobacion
                          setCurrentComponent={setCurrentComponent}
                          setComprobanteSeleccionado={setComprobanteSeleccionado}
                          setIsParamsConsultingUpdate={setIsParamsConsultingUpdate}
                          isParamsConsultingUpdate={isParamsConsultingUpdate}/>;
      case 'detalleComprobantes':
          return <RegistroComprobantes 
                          setCurrentComponent={setCurrentComponent} 
                          comprobanteSeleccionado={comprobanteSeleccionado}
                          setIsParamsConsultingUpdate={setIsParamsConsultingUpdate}
                          isParamsConsultingUpdate={isParamsConsultingUpdate}/>;
      case 'registroUsuarios':
          return <RegistroUsuarios 
                          setCurrentComponent={setCurrentComponent}/>;
      case 'consultaVpc':
          return <ConsultaVpc setCurrentComponent={setCurrentComponent}/>; 
      case 'libroDiario':
          return <LibroDiario setCurrentComponent={setCurrentComponent}/>;  
      case 'listadoComprobante':
          return <ListadoComprobante setCurrentComponent={setCurrentComponent}/>;    
      case 'estadoResultado':
          return <EstadoResultado setCurrentComponent={setCurrentComponent}/>;                 
      default:
        return '';
    }
  };

  return (
    <div className="home-main d-flex flex-column vh-100 bg-light">
      {/* Navbar Superior */}
      <nav className="navbar navbar-expand-md navbar-dark" style={{ backgroundColor: '#002A26' }}>
        <div className="container-fluid">
          <button 
            className="navbar-toggler me-2 d-md-none" 
            type="button" 
            onClick={toggleSidebar}
          >
            <FaBars />
          </button>
          <div className="navbar-brand fw-bold" href="#">
            <img src={logoImage} width="36" alt="Logo"/>
          </div>

          <span className="navbar-text mx-auto d-none d-md-block fw-semibold fs-5">SICONCAV</span>

          <div className="dropdown">
            <button 
              className="btn text-white d-flex align-items-center" 
              onClick={toggleProfileMenu}
            >              
              <span className="ms-2 d-none d-md-inline home-title-perfil">
                {cookies.get('nombre')} {cookies.get('apellido')}
              </span>
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <FaUser className="text-dark" />
              </div>
            </button>
            
            <ul className={`dropdown-menu dropdown-menu-end ${isProfileMenuOpen ? 'show' : ''}`}>
              <li><a className="dropdown-item" href="#">Mi perfil</a></li>
              <li><a className="dropdown-item" href="#">Configuración</a></li>
              <li><a className="dropdown-item" href="#">Ayuda</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item text-danger" href="#" onClick={closeSesion}>
                  <FaSignOutAlt className="me-2" /> Cerrar sesión
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar - Menú lateral */}
        <aside 
          className={`${isSidebarOpen ? 'd-block' : 'd-none'} d-md-block flex-shrink-0 p-3`} 
          style={{ width: '250px', backgroundColor: '#F1F3F6' }}
        >
          <ul className="nav nav-pills flex-column mb-auto">
            {usuarioCaja !== 1 ?
              <li className="nav-item">
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentComponent('dashboardCaja');
                  }} 
                  className={`nav-link ${currentComponent === 'dashboardCaja' ? 'active' : ''}`}
                >
                  <FaHome className="me-2" /> Inicio
                </a>
              </li>
              :
              '' 
            }
            {usuarioCaja == 1 ?
              <li className="nav-item">
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentComponent('dashboard');
                  }} 
                  className={`nav-link ${currentComponent === 'dashboard' ? 'active' : ''}`}
                >
                  <FaHome className="me-2" /> Inicio
                </a>
              </li>
              :
              '' 
            }
            <li>
              <a href="#" className="nav-link text-dark">
                <FaPoll className="me-2" /> Administrativo
              </a>
            </li>
            {usuarioCaja !== 1 ?
              <li>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentComponent('moduloContabilidad');
                  }} 
                  className={`nav-link ${currentComponent === 'moduloContabilidad' || 
                                          currentComponent === 'consultaComprobantes' ||
                                          currentComponent === 'registroComprobantes' ||
                                          currentComponent === 'detalleComprobantes' ? 'active' : ''}`}
                >
                  <FaToolbox className="me-2" /> Contabilidad
                </a>
              </li>
              :
              ''
            }
            
            <li>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentComponent('informe');
                }} 
                className={`nav-link ${currentComponent === 'informe' ||
                                        currentComponent === 'libroDiario' || 
                                        currentComponent === 'estadoResultado' || 
                                        currentComponent === 'listadoComprobante' ? 'active' : ''}`}>
                <FaChartBar className="me-2" /> Informes
              </a>
            </li>
            <li>
              <a href="#" className="nav-link text-dark">
                <FaShareAlt className="me-2" /> Finanzas
              </a>
            </li>
            <li>
              <a href="#" className="nav-link text-dark">
                <FaChartLine className="me-2" /> Inversión
              </a>
            </li>
            {usuarioCaja !== 1 ?
              <li className="nav-item">
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentComponent('registroUsuarios');
                  }} 
                  className={`nav-link ${currentComponent === 'registroUsuarios' ? 'active' : ''}`}
                >
                  <FaUser className="me-2" /> Usuarios Caja
                </a>
              </li>
              :
              ''
           }

           {usuarioCaja === 1 ?

              <li className="nav-item">
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentComponent('cajaAhorro');
                  }} 
                  className={`nav-link ${currentComponent === 'cajaAhorro' ? 'active' : ''}`}
                >
                  <FaBoxArchive className="me-2" /> Caja Ahorro
                </a>
              </li>
              :
              ''
            }

            {usuarioCaja === 1 ? 
              <li className="nav-item">
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentComponent('usuarioSudeca');
                  }} 
                  className={`nav-link ${currentComponent === 'usuarioSudeca' ? 'active' : ''}`}
                >
                  <FaUser className="me-2" /> Usuarios Sudeca
                </a>
              </li>
              :
              ''
            }
          </ul>
        </aside>

        {/* Contenido principal */}
        <main className="flex-grow-1 p-4 overflow-auto">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
};

export default Home;