
const STATUS = {
    1: "Habilitado",
    2: "Deshabilitado",
    3: "Pendiente"
  };

export function EstatusEnum(estatus){
    return STATUS[estatus] || "desconocido";
}
