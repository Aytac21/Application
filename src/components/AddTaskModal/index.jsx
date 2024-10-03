import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "./addTask.css";
import { PiTelevisionSimpleLight } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { RiVoiceprintFill } from "react-icons/ri";
import { FaChevronDown, FaPassport } from "react-icons/fa";
import upload from "../../assets/images/document-upload.svg";

/////////////////////////////////////////////////////////////////////////start
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapClickHandler({ onClick }) {
    useMapEvents({
        click: (e) => {
            onClick(e.latlng);
        },
    });
    return null;
}
/////////////////////////////////////////////////////////////////////////end

const CreateTaskModal = ({ onClose, onTaskCreated }) => {
    const [activeFilter, setActiveFilter] = useState("connection");
    const [formData, setFormData] = useState({
        full_name: '',
        registration_number: '',
        contact_number: '',
        location: '',
        date: '',
        start_time: '',
        end_time: '',
        note: '',
        is_voice: false,
        is_internet: false,
        is_tv: false,
        task_type: '',
        group: [],
        latitude: null,
        longitude: null,
    });
    const [groups, setGroups] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await axios.get('http://135.181.42.192/services/groups/');
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "contact_number" || name == "registration_number") {
            const filteredValue = value.replace(/[^0-9()+\s]/g, "");

            setFormData((prevState) => ({
                ...prevState,
                [name]: filteredValue,
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: checked,
        }));
    };

    const handleTaskTypeChange = (type) => {
        setActiveFilter(type);
        setFormData((prevState) => ({
            ...prevState,
            task_type: type,
        }));
    };

    const handleGroupSelect = (groupId) => {
        setFormData((prevState) => {
            const updatedGroups = prevState.group.includes(groupId)
                ? prevState.group.filter((id) => id !== groupId)
                : [...prevState.group, groupId];
            return { ...prevState, group: updatedGroups };
        });
    };

    const [errorText, setErrorText] = useState('');

    const validateForm = () => {
        const newErrors = {};
        if (!formData.full_name) newErrors.full_name = 'Müştəri adını daxil edin!';
        if (!formData.date) newErrors.date = 'tarixi';
        if (!formData.start_time) newErrors.start_time = 'başlanğıc saatı';
        if (!formData.end_time) newErrors.end_time = 'bitmə saatı';
        if (!formData.registration_number) newErrors.registration_number = 'Qeydiyyat nömrəsi daxil edin!';
        if (!formData.location) newErrors.location = 'Ünvanı daxil edin!';
        if (!formData.is_tv && !formData.is_internet && !formData.is_voice)
            newErrors.service = 'Tv, internet və ya səs xidmətini seçin!';
        if (formData.group.length === 0) newErrors.group = 'Qrup seçin!';

        const errorMessages = [
            newErrors.date,
            newErrors.start_time,
            newErrors.end_time
        ].filter(Boolean);

        let errorText = '';
        if (errorMessages.length > 0) {
            if (errorMessages.length === 1) {
                errorText = errorMessages[0];
            } else if (errorMessages.length === 2) {
                errorText = errorMessages.join(' və ');
            } else {
                const lastMessage = errorMessages.pop();
                errorText = `${errorMessages.join(', ')} və ${lastMessage}`;
            }
        }

        return {
            newErrors,
            errorText
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { newErrors, errorText } = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setErrorText(errorText);
            return;
        }

        try {
            const task_type = activeFilter === "connection" ? "connection" : "problem";

            const formDataToSend = new FormData();
            formDataToSend.append('full_name', formData.full_name);
            formDataToSend.append('registration_number', formData.registration_number);
            formDataToSend.append('contact_number', formData.contact_number);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('date', formData.date);
            formDataToSend.append('start_time', formData.start_time);
            formDataToSend.append('end_time', formData.end_time);
            formDataToSend.append('note', formData.note);
            formDataToSend.append('is_voice', formData.is_voice);
            formDataToSend.append('is_internet', formData.is_internet);
            formDataToSend.append('is_tv', formData.is_tv);
            formDataToSend.append('task_type', task_type);
            formDataToSend.append('groupId', JSON.stringify(formData.groupId));

            if (formData.latitude) {
                formDataToSend.append('latitude', formData.latitude);
            }
            if (formData.longitude) {
                formDataToSend.append('longitude', formData.longitude);
            }

            if (imageFile) {
                formDataToSend.append('passport', imageFile);
            }

            const response = await axios.post('http://135.181.42.192/services/create_task/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                onTaskCreated(response.data);
                onClose();
            } else {
                console.error('Failed to create task', response);
            }

        } catch (error) {
            console.error('Error creating task:', error);
        }
    };


    const renderGroups = () => {
        return groups.map((group) => (
            <div key={group.id} className="dropdown-task-item" onClick={() => handleGroupSelect(group.id)}>
                <input
                    type="checkbox"
                    checked={formData.group.includes(group.id)}
                    onChange={() => handleGroupSelect(group.id)}
                />
                {group.group}
            </div>
        ));
    };

    const [position, setPosition] = useState({ lat: '', lng: '' });
    const customerIcon = new L.Icon({
        iconUrl: 'https://img.icons8.com/?size=100&id=CwAOuD64vULU&format=png&color=000000',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    const handleMapClick = (latlng) => {
        setFormData((prevState) => ({
            ...prevState,
            latitude: latlng.lat,
            longitude: latlng.lng,
        }));
    };

    function extractCoordinatesFromUrl(url) {
        // Regular expressions for different URL formats
        const regex1 = /@(-?\d+\.\d+),(-?\d+\.\d+),/; // For URLs with '@lat,lng'
        const regex2 = /q=(-?\d+\.\d+),(-?\d+\.\d+)/; // For URLs with 'q=lat,lng'
        const regex3 = /place\/(-?\d+\.\d+),(-?\d+\.\d+)/; // For URLs with 'place/lat,lng'

        // Test the URL with different regex patterns
        let match = url.match(regex1) || url.match(regex2) || url.match(regex3);

        if (match) {
            return {
                latitude: parseFloat(match[1]),
                longitude: parseFloat(match[2]),
            };
        }

        return null; // Return null if no coordinates found
    }

    const handleMapLink = (url) => {
        const location = extractCoordinatesFromUrl(url)
        if (location?.latitude && location.longitude) {
            setFormData((prevState) => ({
                ...prevState,
                latitude: location.latitude,
                longitude: location.longitude,
            }));
        }
    };

    const handleChangeMapLink = (event) => {
        const { value } = event.target;

        handleMapLink(value);
    };

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleInputChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <div className="task-modal" onClick={onClose}>
            <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className='task-modal-title'>
                    <h5>Yeni tapşırıq</h5>
                    <span className="close" onClick={onClose}>&times;</span>
                </div>
                <hr />
                <div className='taskModal-taskType'>
                    <button
                        type="button"
                        className={activeFilter === "connection" ? "activeButton" : ""}
                        onClick={() => handleTaskTypeChange("connection")}
                    >
                        Qoşulma
                    </button>
                    <button
                        type="button"
                        className={activeFilter === "problem" ? "activeButton" : ""}
                        onClick={() => handleTaskTypeChange("problem")}
                    >
                        Problem
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className='task-name-date'>

                        <div className="form-group">
                            <label htmlFor="full_name">Müştərinin ad və soyadı:</label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="form-control"
                            />
                            {errors.full_name && <span className="error-message">{errors.full_name}</span>}
                        </div>
                        <div className='form-group'>
                            <div className='task-date-form'>
                                <div className="">
                                    <label htmlFor="date">Tarix:</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="">
                                    <label htmlFor="start_time">Başlayır:</label>
                                    <input
                                        type="time"
                                        id="start_time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="">
                                    <label htmlFor="end_time">Bitir:</label>
                                    <input
                                        type="time"
                                        id="end_time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>

                            </div>
                            {errorText && <span className='capitalize-first-letter error-message'>{errorText} daxil edin!</span>}

                        </div>
                    </div>
                    <div className='registerNumber-contactNumber'>
                        <div className="form-group">
                            <label htmlFor="registration_number">Qeydiyyat nömrəsi:</label>
                            <input
                                type="text"
                                id="registration_number"
                                name="registration_number"
                                value={formData.registration_number}
                                onChange={handleChange}
                                className="form-control"
                            />
                            {errors.registration_number && <span className="error-message">{errors.registration_number}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="contact_number">Əlaqə nömrəsi:</label>
                            <input
                                type="text"
                                id="contact_number"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleChange}
                                className="form-control"
                            />
                            {errors.contact_number && <span className="error-message">{errors.contact_number}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Ünvan:</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="form-control"
                        />
                        {errors.location && <span className="error-message">{errors.location}</span>}
                    </div>
                    <div className='taskService-taskGroup'>
                        <div className="form-group">
                            <div className='tv-voice-internet'>
                                <label htmlFor="tv" className={`form-group ${formData.is_tv ? "activeTask" : ""}`}>
                                    <input
                                        type="checkbox"
                                        id="tv"
                                        name="is_tv"
                                        checked={formData.is_tv}
                                        onChange={handleCheckboxChange}
                                    />
                                    <PiTelevisionSimpleLight /> TV
                                </label>
                                <label htmlFor="internet" className={`form-group ${formData.is_internet ? "activeTask" : ""}`}>
                                    <input
                                        type="checkbox"
                                        id="internet"
                                        name="is_internet"
                                        checked={formData.is_internet}
                                        onChange={handleCheckboxChange}
                                    />
                                    <TfiWorld /> İnternet
                                </label>
                                <label htmlFor="voice" className={`form-group ${formData.is_voice ? "activeTask" : ""}`}>
                                    <input
                                        type="checkbox"
                                        id="voice"
                                        name="is_voice"
                                        checked={formData.is_voice}
                                        onChange={handleCheckboxChange}
                                    />
                                    <RiVoiceprintFill /> Səs
                                </label>
                            </div>
                            {errors.service && <span className="error-message">{errors.service}</span>}
                        </div>
                        <div className="form-group add-task-group-dropdown">
                            <label>Texniki qrup:</label>
                            <div className="dropdown-task" ref={dropdownRef}>
                                <div
                                    className="dropdown-task-toggle"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    {formData.group.length > 0
                                        ? ` ${groups
                                            .filter(group => formData.group.includes(group.id))
                                            .map(group => group.group)
                                            .join(',  ')}`
                                        : 'Qrup seçin'}
                                    <FaChevronDown />
                                </div>
                                {isDropdownOpen && (
                                    <div className="dropdown-task-menu">
                                        {renderGroups()}
                                    </div>
                                )}
                            </div>
                            {errors.group && <span className="error-message">{errors.group}</span>}
                        </div>
                    </div>
                    <div className="form-group mapDiv">
                        <label htmlFor="note">Müştəri ünvanı:</label>
                        <MapContainer center={[40.4093, 49.8671]} zoom={13} style={{ height: '300px', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapClickHandler onClick={handleMapClick} />
                            {formData?.latitude && formData?.longitude && (
                                <Marker icon={customerIcon} position={[formData?.latitude, formData?.longitude]} />
                            )}
                        </MapContainer>

                    </div>


                    <div className="form-group">
                        <label htmlFor="location_link">Ünvan linki</label>
                        <input
                            type="text"
                            id="location_link"
                            name="location_link"
                            onChange={handleChangeMapLink}

                            className="form-control"
                        />
                    </div>
                    {/* <div className="form-group passportImage">
                        <label htmlFor="note">Müştərinin şəxsiyyət vəsiqəsi:</label>
                        <div className="upload-icon-password">
                            <label htmlFor=""></label>
                            <input type="file" name="passport" onChange={handleInputChange} />
                        </div>
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="image-preview"
                            />
                        )}
                    </div> */}

                    <div className="form-group passportImage">
                        <label>Müştərinin şəxsiyyət vəsiqəsi:</label>
                        <div className="upload-container">
                            {!preview ? (
                                <label htmlFor="passport" className="upload-label">
                                    <span>
                                        Yükləmək üçün klikləyin
                                        {/* <span className="file-size">(Maksimum fayl ölçüsü: 25 MB)</span> */}
                                    </span>
                                    <div className="upload-icon">
                                        <img src={upload} alt="" />
                                    </div>
                                </label>
                            ) : (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="image-preview"
                                />
                            )}
                            <input
                                type="file"
                                id="passport"
                                name="passport"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="note">Qeydlər:</label>
                        <textarea
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            className="form-control"
                        />
                        {errors.note && <span className="error-message">{errors.note}</span>}
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Əlavə et
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
