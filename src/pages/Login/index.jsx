import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./login.css";
import ovaltop from "../../assets/images/Oval top.svg";
import ovalbottom from "../../assets/images/Oval bottom.svg";
import { CiMail } from "react-icons/ci";
import { IoKeyOutline } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { logout } from "../../actions/auth";

const required = (value) => {
    if (!value) {
        return "Bu xananın doldurulması məcburidir!";
    }
};

async function refreshAccessToken() {
    try {
        const response = await fetch('http://135.181.42.192/accounts/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refreshToken: localStorage.getItem('refresh'),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        localStorage.setItem('access', data.accessToken);
        return data.accessToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
    }
}


const Login = (props) => {
    let navigate = useNavigate();
    const checkBtn = useRef();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const { isLoggedIn } = useSelector(state => state.auth);

    const dispatch = useDispatch();

    useEffect(() => {
        const interval = setInterval(refreshAccessToken, 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);



    const onChangeEmail = (e) => {
        setEmail(e.target.value);
    };

    const onChangePassword = (e) => {
        setPassword(e.target.value);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post(
                'http://135.181.42.192/accounts/login/',
                { email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const { access_token, refresh_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            // Dispatch login success action
            dispatch({ type: 'LOGIN_SUCCESS', payload: { token: access_token } });

            navigate("/");
        } catch (error) {
            setLoading(false);
            // Handle errors
        }
    };



    if (isLoggedIn) {
        return <Navigate to="/" />;
    }

    return (
        <div className='bg-color'>
            <img src={ovaltop} alt="" />
            <div className='container'>
                <div className="login-page">
                    <div className="login-text">
                        <hr />
                        <h5>Daxil ol</h5>
                        <hr />
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="login-mail-password">
                            <div>
                                <p>Mail adresiniz</p>
                                <label htmlFor="">
                                    <CiMail />
                                    <input type="text" placeholder="Mail adresiniz" name="email"
                                        value={email}
                                        onChange={onChangeEmail}
                                    />
                                </label>
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>
                            <div>
                                <p>Şifrəniz</p>
                                <label htmlFor="">
                                    <IoKeyOutline />
                                    <div className="login-eye">
                                        <input type={showPassword ? "text" : "password"} placeholder="*****" name="password"
                                            value={password}
                                            onChange={onChangePassword}
                                        />
                                        <button
                                            type="button"
                                            className="eye-icon"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </label>
                                {errors.password && <div className="error-message">{errors.password}</div>}
                            </div>
                            {/* <div className="remember-me">
                                <label>
                                    <input type="checkbox" name="" id="" checked={rememberMe}
                                        onChange={toggleRememberMe} />
                                    Məni xatırla
                                </label>
                                <Link to="/re-password">Şifrəni unutmusunuz?</Link>
                            </div> */}
                            {/* {loading && (
                                <span className="spinner-border spinner-border-sm"></span>
                            )} */}
                            <button type="submit">Daxil ol</button>
                        </div>
                        {errors.global ? (
                            <div className="form-group">
                                <div className="alert alert-danger login-alert-text" role="alert" style={{ marginTop: '10px' }}>
                                    {errors.global}
                                </div>
                            </div>
                        ) : (
                            <div className="form-group">
                                <button
                                    style={{ display: "none" }}
                                    ref={checkBtn}
                                ></button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
            <img src={ovalbottom} alt="" />
        </div>
    );
};

export default Login;
