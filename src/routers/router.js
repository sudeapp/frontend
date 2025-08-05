import { Routes, Route, BrowserRouter} from 'react-router-dom';
import Login from '../pages/login';
import Home from '../pages/home';
import PasswordRecovery from '../pages/password_recovery';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login></Login>}></Route>
        <Route path='/login' element={<Login></Login>}></Route>
        <Route path='/home' element={<Home></Home>}></Route>
        <Route path='/password_recovery' element={<PasswordRecovery></PasswordRecovery>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router;
