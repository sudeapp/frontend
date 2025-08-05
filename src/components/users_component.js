import React,{useEffect, useState} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { show_alerta } from '../functions';
import CustomPagination from './CustomPagination';

//const baseUrl = "http://ec2-54-88-157-80.compute-1.amazonaws.com:8080/"; 
const baseUrl="http://localhost:8080";
function Users  () {
    const url='http://ec2-54-88-157-80.compute-1.amazonaws.com:8080//api/users';
    const urlRoles='http://ec2-54-88-157-80.compute-1.amazonaws.com:8080//api/roles';
    const urlCompany='http://ec2-54-88-157-80.compute-1.amazonaws.com:8080//api/empresas';
    const urlUserRol='http://ec2-54-88-157-80.compute-1.amazonaws.com:8080//api/userRol';
    const urlDeleteUserRol='http://ec2-54-88-157-80.compute-1.amazonaws.com:8080//api/usuarioRol';
    
    const [products,setProducts]= useState([]);
    const [idUsuario,setIdUsuario]= useState('');
    const [usuario,setUsuario]= useState('');
    const [pass,setPass]= useState('');
    const [pass2,setPass2]= useState('');
    const [nombre,setNombre]= useState('');
    const [apellido,setApellido]= useState('');
    const [cedula,setCedula]= useState('');
    const [direccion,setDireccion]= useState('');
    const [telefono,setTelefono]= useState('');
    const [celular,setCelular]= useState('');
    const [fechaNac,setFechaNac]= useState('');
    const [email,setEmail]= useState('');
    var [operation,setOperation]= useState(1);
    const [title,setTitle]= useState('');
    const [roles,setRoles]= useState([]);
    const [idRol,setIdRol]= useState('');
    const [rol,setRol]= useState('');
    const [descripcion,setDescripcion]= useState('');
    const [status,setStatus]= useState('');
    const [empresas,setEmpresas]= useState([]);
    const [idEmpresa,setIdEmpresa]= useState('');
    const [codEmpresa,setCodEmpresa]= useState('');
    const [rif,setRif]= useState('');
    const [razonSocial,setRazonSocial]= useState('');
    const [userRoles,setUserRoles]= useState([]);
    const [idUserRol,setIdUserRol]= useState('');
    var idUserRoleDelete = 0;

    const [searchFilter, setSearchFilter] = useState(''); // filter the search
    const [currentPage, setCurrentPage] = useState(1); // set the current page
    const pageSize = 10; // show row in table

    useEffect( ()=>{
        getProducts();
        getUserRoles();
    },[]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchFilter]);

      const handleFilter = (e) => {
        setSearchFilter(e.target.value);
      };
    
      const filteredData = products.filter(
        (item) =>
            item.usuario.toLowerCase().includes(searchFilter.toLowerCase()) ||
            item.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
            item.apellido.toLowerCase().includes(searchFilter.toLowerCase()) ||
            item.direccion.toLowerCase().includes(searchFilter.toLowerCase()) ||
            item.telefono.toLowerCase().includes(searchFilter.toLowerCase()) ||
            item.celular.toLowerCase().includes(searchFilter.toLowerCase()) ||
            item.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
            item.fechaNac.toLowerCase().includes(searchFilter.toLowerCase())
            //item.age.toString().includes(searchFilter)
      );

      const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );

    const getProducts = async () => {             
        
        const respuesta = await axios.get(url)
            .catch(function (error) {
            console.log("error axios: "+error);
          });
        console.log("respuesta.data: "+respuesta.data)
        setProducts(respuesta.data);
    }

    const getRoles = async () => {             
        console.log("getRoles urlRoles: "+urlRoles)
        const respuesta = await axios.get(urlRoles)
            .catch(function (error) {
            console.log("getRoles error axios: "+error);
          });
        console.log("getRoles respuesta.data: "+respuesta.data)
        setRoles(respuesta.data);
    }

    const getCompanies = async () => {             
        console.log("getCompanygetRoles urlCompany: "+urlCompany)
        const respuesta = await axios.get(urlCompany)
            .catch(function (error) {
            console.log("urlCompany error axios: "+error);
          });
        console.log("urlCompany respuesta.data: "+respuesta.data)
        setEmpresas(respuesta.data);
    }

    const getUserRoles = async () => {             
        
        const respuesta = await axios.get(urlUserRol)
            .catch(function (error) {
            console.log("error urlUserRol axios: "+error);
          });
        console.log("***** urlUserRol respuesta.data *****");
        console.log(respuesta.data)
        setUserRoles(respuesta.data);
    }
    
    const openModal = (op,idUsuario, usuario, pass, nombre, apellido, cedula, direccion, telefono, celular, email, fechaNac) =>{
        setIdUsuario('');
        setUsuario('');
        setPass('');
        setPass2('');
        setNombre('');
        setApellido('');
        setCedula('');
        setDireccion('');
        setTelefono('');
        setCelular('');
        setEmail('');
        setFechaNac('');
        setOperation(op);
        if(op === 1){
            setTitle('Registrar Usuario');
            getRoles();
            getCompanies();
        }
        else if(op === 2){
            setTitle('Editar Usuario');
            setIdUsuario(idUsuario);
            setUsuario(usuario);
            setPass(pass);
            setPass2(pass2);
            setNombre(nombre);
            setApellido(apellido);
            setCedula(cedula);
            setDireccion(direccion);
            setTelefono(telefono);
            setCelular(celular);
            setEmail(email);
            setFechaNac(fechaNac);
            getRoles();
        }
        window.setTimeout(function(){
            document.getElementById('usuario').focus();
        },500);
    }
    const validar = () => {
        var parametros;
        var metodo;

        var myregex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;   
        console.log("usuario.trim().length: "+usuario.trim().length)

        if(usuario.trim() === ''){
            show_alerta('Escribe el Usuario','warning');
        }
        else if((usuario.trim().length < 3) || (usuario.trim().length < 8)){
            show_alerta('El Usuario debe tener mínimo 4 caracteres o máximo 8 caracteres','warning');
        }
        else if(pass.trim() === ''){
            show_alerta('Escriba la Contraseña','warning');
        }
        else if(pass.trim().length !== 8){
            show_alerta('La Contraseña debe ser igual a 8 caracteres','warning');
        }
        else if(pass.trim() !== pass2.trim()){
            show_alerta('Las Contraseñas no Coinciden','warning');
        }
        else if(!myregex.test(pass)){
            show_alerta(pass + ' no es Válido','warning');
        }
        else if(nombre.trim() === ''){
            show_alerta('Escribe el Nombre','warning');
        }
        else if(apellido === ''){
            show_alerta('Escribe el Apellido','warning');
        }
        else if(cedula.trim() === ''){
            show_alerta('Escribe la Cédula','warning');
        }
        else{
            if(operation === 1){                
                parametros= {usuario:usuario.trim(),pass: pass.trim(),nombre: nombre.trim(),apellido:apellido.trim(),cedula:cedula.trim(),direccion:direccion.trim(),telefono:telefono.trim(),celular:celular.trim(),email: email.trim(),fechaNac:fechaNac.trim(),idRol:idRol.trim(),idEmpresa:idEmpresa.trim()};
                metodo= 'POST';
            }
            else{
                parametros={id:idUsuario,usuario:usuario.trim(),pass: pass.trim(),nombre:nombre.trim(),apellido: apellido.trim(),cedula:cedula.trim(),direccion:direccion.trim(),telefono:telefono.trim(),celular:celular.trim(),email: email.trim(),fechaNac:fechaNac.trim(),idRol:idRol.trim(),idEmpresa:idEmpresa.trim()};
                metodo= 'PUT';
                operation = 2
            }
            
            envarSolicitud(metodo,parametros);
        }
    }
    const envarSolicitud = async(metodo,parametros) => {
        console.log("parametros.idRol:-"+parametros.idRol+"-");
        console.log("operation: "+operation);

        var itemJ = {}

        const dataJson = JSON.stringify({ usuario:parametros.usuario,pass: parametros.pass,nombre: parametros.nombre,apellido:parametros.apellido,cedula:parametros.cedula,direccion:parametros.direccion,telefono:parametros.telefono,celular:parametros.celular,email: parametros.email,fechaNac:parametros.fechaNac });
        console.log("**** dataJson: ");
        console.log(dataJson);

        const customConfig = {
            headers: {
            'Content-Type': 'application/json; charset=utf8',
            'Accept': 'application/json'
            }
        };         
        if(operation === 1){ 
            axios.post(url, dataJson,customConfig).then((response) => {
                console.log(response);
                console.log(response.data);
                console.log("**** response.data.id");
                console.log(response.data.id);
                console.log("**** response.data.result");
                console.log(response.data.result);
                console.log("**** response.status: "+response.status);

                roles.forEach((item, index) => {
                    if((parseInt(parametros.idRol))===(parseInt(item.idRol))) {
                        
                        empresas.forEach((item2, index) => {
                            if((parseInt(item2.idEmpresa))===(parseInt(-46))) {
                                    itemJ.user = { "idUsuario": response.data.id, "usuario": parametros.usuario, "pass": parametros.pass, "nombre": parametros.nombre, "apellido": 
                                    parametros.apellido,"cedula":parametros.cedula,"direccion":parametros.direccion,"telefono":parametros.telefono,"celular":parametros.celular,"email": parametros.email, "fechaNac": parametros.fechaNac}
                                
                                    itemJ.role = { "idRol": item.idRol, "rol": item.rol, "descripcion" : item.descripcion, "status": item.status}
                                    
                                    itemJ.company = { "idEmpresa":item2.idEmpresa,"codEmpresa": item2.codEmpresa,"rif": item2.rif,"razonSocial":item2.razonSocial }
                                    
                            }
                        });
                        
                    }
                });
                
                console.log(itemJ);

                //show_alerta('success','success');
                if(response.status === 200 && Boolean(response.data.result)){
                    axios.post(urlUserRol, itemJ,customConfig).then((responseUserRol) => {
                        console.log(responseUserRol);
                        console.log("**** userRol responseUserRol.status: "+responseUserRol.status);
                        console.log("responseUserRol.data.result: "+responseUserRol.data.result);

                        show_alerta(response.data.mensaje,'success');
                        if(responseUserRol.status === 200 && Boolean(responseUserRol.data.result)){
                            var tipo = responseUserRol.status;
                            console.log("responseUserRol.status: "+tipo);
                            document.getElementById('btnCerrar').click();
                            getProducts();
                        }
                    })
                    .catch(function(error){
                        show_alerta('Error en la solicitud','error');
                        console.log("UserRol error: "+error);
                    });
                } else {
                    show_alerta(response.data.mensaje,'error');
                }
            })
            .catch(function(error){
                show_alerta('Error en la solicitud','error');
                console.log("error: "+error);
            });
        }
        else if(operation === 2){
            console.log("parametros.idUsuario:-"+parametros.id+"-");
            roles.forEach((item, index) => {
                if((parseInt(parametros.idRol))===(parseInt(item.idRol))) {                        
                    empresas.forEach((item2, index) => {
                        if((parseInt(item2.idEmpresa))===(parseInt(-46))) {
                                itemJ.user = { "idUsuario": parametros.id, "usuario": parametros.usuario, "pass": parametros.pass, "nombre": parametros.nombre, "apellido": 
                                parametros.apellido,"cedula":parametros.cedula,"direccion":parametros.direccion,"telefono":parametros.telefono,"celular":parametros.celular,"email": parametros.email, "fechaNac": parametros.fechaNac}
                                itemJ.role = { "idRol": item.idRol, "rol": item.rol, "descripcion" : item.descripcion, "status": item.status}
                                itemJ.company = { "idEmpresa":item2.idEmpresa,"codEmpresa": item2.codEmpresa,"rif": item2.rif,"razonSocial":item2.razonSocial }                             
                        }
                    });
                    
                }
            });
            console.log(itemJ);

            axios.put(url+'/'+parametros.id, dataJson,customConfig).then((response) => {
                console.log("PUT - **** response  ****");
                console.log(response);
                console.log(response.data);
                console.log("PUT - **** response.data.idUsuario");
                console.log(response.data.idUsuario);
                console.log("PUT - **** response.data.result");
                console.log(response.data.result);
                console.log("PUT - **** response.status: "+response.status);
                
             if(response.status === 200){
                    axios.post(urlUserRol, itemJ,customConfig).then((responseUserRol) => {
                        console.log("PUT - **** responseUserRol ****");
                        console.log(responseUserRol);
                        console.log("**** PUT - userRol responseUserRol.status: "+responseUserRol.status);
                        console.log("PUT - responseUserRol.data.result: "+responseUserRol.data.result);

                        show_alerta(response.data.mensaje,'success');
                        if(responseUserRol.status === 200 && Boolean(responseUserRol.data.result)){
                            var tipo = responseUserRol.status;
                            console.log("PUT - responseUserRol.status: "+tipo);
                            document.getElementById('btnCerrar').click();
                            getProducts();
                        }
                    })
                    .catch(function(error){
                        show_alerta('Error en la solicitud','error');
                        console.log("PUT - UserRol error: "+error);
                    });
                } else {
                    show_alerta(response.data.mensaje,'error');
                }
            })
            .catch(function(error){
                show_alerta('Error en la solicitud','error');
                console.log("PUT - error: "+error);
            });
        }
        else if(operation === 3){
            getUserRoles();
            // Simple DELETE request con axios
            console.log("parametros.id: "+parametros.id);
            console.log("parametros.idUserRoleDelete: "+parametros.idUserRoleDelete);

            idUserRoleDelete=0;
            userRoles.forEach((itemUserRole, index) => {
                console.log("**** envarSolicitud - userRoles ****");
                console.log(userRoles);
               
                if((parseInt(itemUserRole.user.idUsuario))===(parseInt(parametros.id))) {
                    idUserRoleDelete = itemUserRole.idUserRol;
                    console.log("**** idUserRoleDelete: "+idUserRoleDelete);
                }
            })

            if(parseInt(idUserRoleDelete)!==0){
                axios.delete(urlDeleteUserRol+'/'+idUserRoleDelete)
                .then((responseDeleteUserRol) => {
                    console.log("**** responseDeleteUserRol ****");
                    console.log(responseDeleteUserRol);
                    axios.delete(url+'/'+parametros.id)
                        .then((responseDeleteUser) => {
                            console.log("**** responseDeleteUser ****");
                            console.log(responseDeleteUser);
                            show_alerta('Usuario Eliminado Satisfactoriamentes','success');
                            getProducts();
                    })
                    .catch(function(error){
                        show_alerta('Error en la solicitud','error');
                        console.log("error User Delete: "+error);
                    });
                })
                .catch(function(error){
                    show_alerta('Error en la solicitud','error');
                    console.log("error UserRol Delete: "+error);
                });
                    
            }
        }        
    }

    const deleteProduct= (id,name) =>{
        const MySwal = withReactContent(Swal);
        
        console.log("id: "+id);
        console.log("name: "+name);
        console.log("idUserRoleDelete: "+idUserRoleDelete);

        MySwal.fire({
            title:'¿Seguro de eliminar el usuario '+usuario+' ?',
            icon: 'question',text:'No se podrá dar marcha atrás',
            showCancelButton:true,confirmButtonText:'Si, eliminar',cancelButtonText:'Cancelar'
        }).then((result) =>{
            if(result.isConfirmed){
                setIdUsuario(idUsuario);
                operation = 3;
                envarSolicitud('DELETE',{id:id});
            }
            else{
                show_alerta('El Usuario NO fue eliminado','info');
            }
        });
    }
  return (
    <div className='App'>
        <div className='container-fluid'>
            <div className='row mt-3'>
                <div className='col-md-4 offset-md-4'>
                    <div className='d-grid mx-auto'>
                        <button onClick={()=> openModal(1)} className='btn btn-dark' data-bs-toggle='modal' data-bs-target='#modalProducts'>
                            <i className='fa-solid fa-circle-plus'></i> Registrar Usuario
                        </button>
                    </div>
                </div>
            </div>
            <div className='row mt-3'>
                <div className='col-12'>
                    <div className='table-responsive'>
                        <table className='table table-hover mb-0'>
                            <thead>
                                <tr align="center"  class="table-dark">
                                    <th>#</th><th>USERNAME</th><th>NOMBRE</th><th>APELLIDO</th><th>CEDULA</th>
                                    <th>DIRECCION</th><th>TELEFONOS</th><th>EMAIL</th><th>FECHA NACIMIENTO</th><th></th>
                                </tr>
                            </thead>
                            <tbody className='table-group-divider'>
                               {/* {products.map( (product,i)=>( */}
                               { paginatedData.length > 0 ? (
                                    paginatedData.map((item, i) => (
                                    <tr key={item.id} class="table-success" align="center">
                                        <td>{(currentPage - 1) * pageSize + i + 1}</td>
                                        <td>{item.usuario}</td>
                                        <td>{item.nombre}</td>
                                        <td>{item.apellido}</td>
                                        <td>{item.cedula}</td>
                                        <td>{item.direccion}</td>
                                        <td>{item.telefono} 	&nbsp;-&nbsp;
                                            {item.celular}</td>
                                        <td>{item.email}</td>
                                        <td>{item.fechaNac}</td>
                                        {/* <td>${new Intl.NumberFormat('es-mx').format(product.price)}</td> */}
                                       
                                        <td>
                                            <button onClick={() => openModal(2,item.idUsuario,item.usuario,item.nombre,item.apellido,item.cedula,item.direccion,item.telefono,item.celular,item.email,item.fechaNac)}
                                                 className='btn btn-warning' data-bs-toggle='modal' data-bs-target='#modalProducts'>
                                                <i className='fa-solid fa-edit'></i>
                                            </button>
                                            &nbsp; 
                                            <button onClick={()=>deleteProduct(item.idUsuario,item.usuario)} className='btn btn-danger'>
                                                <i className='fa-solid fa-trash'></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                              <tr>
                                <td colSpan="10">No data found</td>
                              </tr>
                            )}    
                               {/*   ))
                                }  */}
                            </tbody>
                        </table> 
                        <div align="center">
                            {filteredData.length > 0 &&
                                <>
                                    <CustomPagination
                                        itemsCount={filteredData.length}
                                        itemsPerPage={pageSize}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        alwaysShown={true}
                                    />
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id='modalProducts' className='modal fade' aria-hidden='true'>
            <div className='modal-dialog'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <label className='h5'><center>{title}</center></label>
                        <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                    </div>
                    <div className='modal-body'>
                        <input type='hidden' id='idUsuario'></input>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-gift'></i></span>
                            <input type='text' id='usuario' className='form-control' placeholder='UserName' minlength="4" maxlength="8" value={usuario}
                            onChange={(e)=> setUsuario(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-gift'></i></span>
                            <input type='password' id='pass' className='form-control' placeholder='Contraseña' maxlength="8" value={pass}
                            onChange={(e)=> setPass(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-gift'></i></span>
                            <input type='password' id='pass2' className='form-control' placeholder='Confirmar Contraseña' maxlength="8" value={pass2}
                            onChange={(e)=> setPass2(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-gift'></i></span>
                            <input type='text' id='nombre' className='form-control' placeholder='Nombre' value={nombre}
                            onChange={(e)=> setNombre(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                            <input type='text' id='apellido' className='form-control' placeholder='Apellido' value={apellido}
                            onChange={(e)=> setApellido(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                            <input type='text' id='cedula' className='form-control' placeholder='Cédula' value={cedula}
                            onChange={(e)=> setCedula(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                            <input type='text' id='direccion' className='form-control' placeholder='Dirección' value={direccion}
                            onChange={(e)=> setDireccion(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                            <input type='text' id='telefono' className='form-control' placeholder='Telefono' value={telefono}
                            onChange={(e)=> setTelefono(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                            <input type='text' id='celular' className='form-control' placeholder='Celular' value={celular}
                            onChange={(e)=> setCelular(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-gift'></i></span>
                            <input type='text' id='email' className='form-control' placeholder='Email' value={email}
                            onChange={(e)=> setEmail(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                            <input type='date' id='fechaNac' className='form-control' placeholder='Fecha Nacimiento' value={fechaNac}
                            onChange={(f)=> setFechaNac(f.target.value)}></input>
                            {/* <span id="fechaNacSelected"></span> */}
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                            <label className='form-control'>Roles</label>
                                <select
                                    id="comboRoles"
                                    name="idRole"
                                    className="form-control"
                                    placeholder='Roles'
                                    onChange={(e)=> setIdRol(e.target.value)}
                                >
                                    {
                                    roles.map((rol) => {
                                    return (
                                        <option key={rol.idRol} value={rol.idRol}>
                                            {rol.rol}
                                        </option>
                                    );
                                    })}
                                </select>
                        </div>
                        {/* <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                            <label className='form-control'>Empresas</label>
                                <select
                                    id="comboEmpresas"
                                    name="idEmpresas"
                                    className="form-control"
                                    onChange={(e)=> setIdEmpresa(e.target.value)}
                                >
                                    {
                                    empresas.map((empresa) => {
                                    return (
                                        <option key={empresa.idEmpresa} value={empresa.idEmpresa}>
                                            {empresa.codEmpresa}
                                        </option>
                                    );
                                    })}
                                </select>
                        </div> */}
                        {/* <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-dollar-sign'></i></span>
                            <input type='text' id='precio' className='form-control' placeholder='Precio' value={price}
                            onChange={(e)=> setPrice(e.target.value)}></input>
                        </div> */}
                        <div className='d-grid col-6 mx-auto'>
                            <button onClick={() => validar()} className='btn btn-success'>
                                <i className='fa-solid fa-floppy-disk'></i> Guardar
                            </button>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button type='button' id='btnCerrar' className='btn btn-secondary' data-bs-dismiss='modal'>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Users