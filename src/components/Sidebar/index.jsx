import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from "../../assets/images/logo.svg";
import { GoHomeFill } from "react-icons/go";
import taskIcon from "../../assets/images/Task.svg";
import { FaWarehouse } from "react-icons/fa";
import performance from "../../assets/images/icons.svg";
import Engineering from "../../assets/images/Engineering.svg";
import { IoMdSettings } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../actions/auth";
import { useNavigate } from 'react-router-dom';
import "./sidebar.css";
import LogoutModal from '../LogoutModal';

const Sidebar = ({ children, isSidebarOpen, onClose }) => {
    const { userType } = useUser();
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        const items = [
            {
                path: "/",
                name: "Ana Səhifə",
                icon: <GoHomeFill />
            },
            {
                path: "/tasks/",
                name: "Tapşırıqlar",
                icon: <img src={taskIcon} alt="Task Icon" style={{ width: '24px', height: '24px' }} />
            },
            userType !== 'Texnik' && {
                path: "/warehouse/",
                name: "Anbar",
                icon: <FaWarehouse />
            },
            {
                path: "/performance/",
                name: "Performans",
                icon: <img src={performance} alt="Performance Icon" style={{ width: '24px', height: '24px' }} />
            },
            userType !== 'Texnik' && {
                path: "/employees/",
                name: "İşçilər",
                icon: <img src={Engineering} alt="Engineering Icon" style={{ width: '24px', height: '24px' }} />
            },
        ].filter(Boolean);

        setMenuItems(items);
    }, [userType]);

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);

    const handleLogout = () => {
        setShowModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_type');
        localStorage.removeItem('is_admin');
        localStorage.removeItem('phone');
        dispatch(logout());
        setShowModal(false);
        navigate('/login/');
    };

    const handleLogin = () => {
        navigate('/login/');
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    const isLoginPage = location.pathname === "/login" || location.pathname === "/login/";

    const [isAuth, setIsAuth] = useState(false);
    useEffect(() => {
        if (localStorage.getItem('access_token') !== null) {
            setIsAuth(true);
        }
    }, [isAuth]);

    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen, onClose]);


    return (
        <div className={`sidebar${isLoginPage ? ' hidden' : ''}${isSidebarOpen ? ' show' : ''}`} ref={sidebarRef}>
            <div className="top_section">
                <img src={logo} alt="" className='digitask-logo' />
                <button className="sidebar-close-btn" onClick={onClose}>×</button>
            </div>
            <p>Əsas</p>
            <div>
                {
                    menuItems.map((item, index) => (
                        <NavLink
                            reloadDocument
                            to={item.path}
                            key={index}
                            className="aside-link"
                            activeclassname="active"
                        >
                            <div className="icon">{item.icon}</div>
                            <div className="link_text">{item.name}</div>
                        </NavLink>
                    ))
                }
            </div>
            <p>Digər</p>
            <div>
                <ul>
                    {/* <li className={location.pathname === "/settings/" ? "active" : ""}>
                        <IoMdSettings />
                        <Link to="/settings/">Parametrlər</Link>
                    </li>
                    <li className={location.pathname === "/contact/" ? "active" : ""}>
                        <BiSupport />
                        <Link to="/contact/">Əlaqə</Link>
                    </li> */}
                    {isAuth ? (
                        <li onClick={handleLogout}>
                            <MdLogout />
                            <span>Çıxış</span>
                        </li>
                    ) : (
                        <li onClick={handleLogin}>
                            <MdLogout />
                            <span>Giriş</span>
                        </li>
                    )}
                </ul>
            </div>
            <LogoutModal
                showModal={showModal}
                handleClose={handleModalClose}
                handleLogout={confirmLogout}
            />
            <main>{children}</main>
        </div>
    );
};

export default Sidebar;
