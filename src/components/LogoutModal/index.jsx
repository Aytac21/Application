import React from 'react';
import ReactDOM from 'react-dom';
import './logoutModal.css';

const LogoutModal = ({ showModal, handleClose, handleLogout }) => {
    if (!showModal) return null;

    return ReactDOM.createPortal(
        <div className="logout-modal-overlay">
            <div className="logout-modal-content">
                <h2>Çıxış</h2>
                <p>Çıxış etmək istədiyinizdən əminsiniz?</p>
                <div>
                    <button onClick={handleClose} className="cancel-logout">Ləğv et</button>
                    <button onClick={handleLogout} className="confirm-logout">Çıxış et</button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root') // Targeting a specific DOM node
    );
};

export default LogoutModal;
