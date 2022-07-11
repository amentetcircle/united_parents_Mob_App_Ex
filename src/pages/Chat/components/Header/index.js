import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './style.css';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../actions';

/**
* @author
* @function Header
**/

const Header = (props) => {

  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // const logout = () => {
  //   dispatch(logout())
  // }

  return(
    <header className="header">
        <div style={{display: 'flex'}}>
          <div className="logo">Messenger</div>

        </div>
          <div style={{margin: '20px 0', color: '#fff', fontWeight: 'bold'}}>
          </div>

    </header>
   )

 }

export default Header