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

const Sidebar = ({ children }) => {
    const menuItem = [
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
        {
            path: "/warehouse/",
            name: "Anbar",
            icon: <FaWarehouse />
        },
        {
            path: "/performance/",
            name: "Performans",
            icon: <img src={performance} alt="Task Icon" style={{ width: '24px', height: '24px' }} />
        },
        {
            path: "/employees/",
            name: "İşçilər",
            icon: <img src={Engineering} alt="Task Icon" style={{ width: '24px', height: '24px' }} />
        },
    ];
    

    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="top_section">
                <img src={logo} alt="" className='digitask-logo' />
            </div>
            <p>Əsas</p>
            <div>
                {
                    menuItem.map((item, index) => (
                        <NavLink
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
                    <li className={location.pathname === "/settings" ? "active" : ""}>
                        <IoMdSettings />
                        <Link to="/settings">Parametrlər</Link>
                    </li>
                    <li className={location.pathname === "/contact" ? "active" : ""}>
                        <BiSupport />
                        <Link to="/contact">Əlaqə</Link>
                    </li>
                    <li>
                        <MdLogout />
                        {user ? (
                            <button onClick={handleLogout}>Çıxış</button>
                        ) : (
                            <button onClick={handleLogin}>Giriş</button>
                        )}
                    </li>
                </ul>
            </div>
            <main>{children}</main>
        </div>
    );
};

export default Sidebar;