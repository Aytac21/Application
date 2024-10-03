import { useState } from 'react';
import axios from 'axios';
import "./AddWarehouseModal.css"

const AddWarehouseModal = ({ onClose, onWarehouseAdded }) => {
    const [name, setName] = useState('');
    const [region, setRegion] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post('http://135.181.42.192/services/create_warehouse/', { name, region }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            onWarehouseAdded(response.data);
            onClose();
        } catch (error) {
            console.error('Error adding group:', error);
        }
    };

    return (
        <div className="group-modal-overlay">
            <div className="add-group-modal-content">
                <div className="add-group-modal-title">
                    <h5>Yeni qrup</h5>
                    <span onClick={onClose}>&times;</span>
                </div>
                <hr />
                <form onSubmit={handleSubmit}>
                    <div>
                        <div className='form-group'>
                            <label htmlFor="groupName">Ad</label>
                            <input
                                type="text"
                                id="groupName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className='form-group'>
                            <label htmlFor="groupRegion">Region</label>
                            <input
                                type="text"
                                id="groupRegion"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit">Anbar əlavə et</button>
                </form>
            </div>
        </div>
    );
};

export default AddWarehouseModal;
