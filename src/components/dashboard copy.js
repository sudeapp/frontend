import React, { useEffect,useState } from 'react';
import { FaBars} from 'react-icons/fa';

function Dashboard() {
      // Datos de ejemplo para la tabla
  const tableData = [
    { id: 1, nombre: 'Proyecto A', estado: 'Activo', fecha: '2023-05-15' },
    { id: 2, nombre: 'Proyecto B', estado: 'Pendiente', fecha: '2023-06-20' },
    { id: 3, nombre: 'Proyecto C', estado: 'Completado', fecha: '2023-04-10' },
    { id: 4, nombre: 'Proyecto D', estado: 'Activo', fecha: '2023-07-01' },
  ];
  return (
    <>
      <div className="container-fluid">
            <div className="row mb-4">
              <div className="col">
                <h2 className="fw-semibold">Tabla de Ejemplo</h2>
              </div>
            </div>
            
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.nombre}</td>
                          <td>
                            <span className={`badge ${item.estado === 'Activo' ? 'bg-success' : 
                              item.estado === 'Pendiente' ? 'bg-warning text-dark' : 
                              'bg-primary'}`}>
                              {item.estado}
                            </span>
                          </td>
                          <td>{item.fecha}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
    </>
  )
}

export default Dashboard;