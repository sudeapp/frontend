import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export function show_alerta(mensaje,icono,foco=''){
    onfocus(foco);
    const MySwal = withReactContent(Swal);
    MySwal.fire({
        title:mensaje,
        icon:icono
    });
}

export function show_alerta2(message, type = 'success', showCancelButton = false){
    return Swal.fire({
      title: getTitleByType(type),
      text: message,
      icon: type,
      showCancelButton: showCancelButton,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'custom-swal-container'
      }
    }).then((result) => {
      return result.isConfirmed;
    });
}

function onfocus(foco){
    if(foco !== ''){
        document.getElementById(foco).focus();
    }
}

const getTitleByType = (type) => {
    const titles = {
      success: '¡Éxito!',
      error: '¡Error!',
      warning: '¡Advertencia!',
      info: 'Información',
      question: 'Confirmación'
    };
    
    return titles[type] || 'Alerta';
  };
  
  // Estilos CSS para personalizar SweetAlert2
  const customStyles = `
    <style>
      .custom-swal-container {
        z-index: 10000;
      }
      .swal2-popup {
        border-radius: 8px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      .swal2-title {
        font-size: 1.5rem;
        font-weight: 600;
      }
      .swal2-confirm {
        border-radius: 5px;
        padding: 10px 20px;
      }
      .swal2-cancel {
        border-radius: 5px;
        padding: 10px 20px;
      }
    </style>
  `;
  
  // Agregar estilos al documento
  if (typeof document !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', customStyles);
  }