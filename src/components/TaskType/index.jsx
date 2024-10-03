import { useState, useEffect, useRef } from 'react';
import { RiEdit2Line } from "react-icons/ri";
import { IoPersonOutline } from "react-icons/io5";
import { BsTelephone } from "react-icons/bs";
import { GoClock } from "react-icons/go";
import { LiaPhoneVolumeSolid } from "react-icons/lia";
import { RiMapPinLine, RiVoiceprintFill } from "react-icons/ri";
import { MdOutlineMiscellaneousServices, MdOutlineEngineering, MdAdd, MdOutlineEdit } from "react-icons/md";
import { BiComment } from "react-icons/bi";
import './detailsModal.css';
import { FaChevronDown, FaMapPin, FaPassport } from "react-icons/fa";
import AddSurveyModal from '../AddSurveyModal';
import { PiTelevisionSimple } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { SiTyper } from "react-icons/si";
import UpdateTVModal from '../UpdateTVModal';
import UpdateInternetModal from '../UpdateInternetModal';
import UpdateVoiceModal from '../UpdateVoiceModal';
import { useUser } from '../../contexts/UserContext';
import upload from "../../assets/images/document-upload.svg";


const TASK_TYPES = [
    { value: 'connection', label: 'Qoşulma' },
    { value: 'problem', label: 'Problem' }
];

const STATUS_OPTIONS = [
    { value: 'waiting', label: 'Gözləyir' },
    { value: 'inprogress', label: 'Qəbul edilib' },
    { value: 'started', label: 'Başlanıb' },
    { value: 'completed', label: 'Tamamlandı' }
];

const SERVICE_OPTIONS = [
    { value: 'tv', label: 'TV' },
    { value: 'internet', label: 'İnternet' },
    { value: 'voice', label: 'Səs' }
];

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

function DetailsModal({ onClose, taskId, userType, onAddSurveyClick, onTaskUpdated }) {
    const { isAdmin } = useUser();
    const [taskDetails, setTaskDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [groups, setGroups] = useState([]);
    const taskTypeDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);
    const serviceDropdownRef = useRef(null);
    const groupDropdownRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
            if (taskTypeDropdownRef.current && !taskTypeDropdownRef.current.contains(event.target)) {
                setIsDropdownOpenTaskType(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsDropdownOpenStatus(false);
            }
            if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
                setIsDropdownOpenService(false);
            }
            if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target)) {
                setIsDropdownOpenGroup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const [formData, setFormData] = useState({
        task_type: '',
        full_name: '',
        start_time: '',
        end_time: '',
        date: '',
        registration_number: '',
        contact_number: '',
        location: '',
        passport: null,
        services: [],
        status: '',
        group: [],
        note: '',
        latitude: '',
        longitude: '',
        is_tv: "",
        is_internet: "",
        is_voice: ""

    });

    const formatTime = (time) => {
        if (!time) return "-";

        const date = new Date(`1970-01-01T${time}Z`);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
    };

    const monthNames = [
        "yanvar",
        "fevral",
        "mart",
        "aprel",
        "may",
        "iyun",
        "iyul",
        "avqust",
        "sentyabr",
        "oktyabr",
        "noyabr",
        "dekabr"
    ];

    useEffect(() => {
        if (taskId) {
            fetch(`http://135.181.42.192/services/task/${taskId}/`)
                .then(response => response.json())
                .then(data => {
                    setTaskDetails(data);
                    setFormData({
                        task_type: data.task_type,
                        full_name: data.full_name,
                        start_time: data.start_time,
                        end_time: data.end_time,
                        date: data.date,
                        registration_number: data.registration_number,
                        contact_number: data.contact_number,
                        location: data.location,
                        passport: null,
                        services: data.services,
                        status: data.status,
                        group: data.group.map(g => g.group),
                        note: data.note,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        is_tv: data.is_tv,
                        is_voice: data.is_voice,
                        is_internet: data.is_internet,
                    });
                })
                .catch(error => console.error('Error fetching task details:', error));
        }

        fetch('http://135.181.42.192/services/groups/')
            .then(response => response.json())
            .then(data => setGroups(data))
            .catch(error => console.error('Error fetching groups:', error));
    }, [taskId, isEditing]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;


        if (name === "registration_number" || name === "contact_number") {

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

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const [addedServices, setAddedServices] = useState([]);
    const [imageFile, setImageFile] = useState(null);

    const handleInputPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setFormData(prevState => ({
                ...prevState,
                passport: file
            }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        Object.keys(formData).forEach(key => {
            if (formData[key] !== taskDetails[key]) {
                formData.append(key, formData[key]);
            }
        });

        if (imageFile) {
            formData.append('passport', imageFile);
        }

        fetch(`http://135.181.42.192/services/update_task/${taskId}/`, {
            method: 'PATCH',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(`Error: ${response.status} ${response.statusText} - ${JSON.stringify(err)}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                setTaskDetails(data);
                setAddedServices(data.addedServices);
                setFormData(prevFormData => ({
                    ...prevFormData,
                }));
                setIsEditing(false);
                onClose();
                onTaskUpdated(data);
            })
            .catch(error => console.error('Error updating task:', error));
    };


    const handleGroupSelect = (groupId) => {
        setFormData((prevFormData) => {
            const newGroup = prevFormData.group.includes(groupId)
                ? prevFormData.group.filter(id => id !== groupId)
                : [...prevFormData.group, groupId];
            return { ...prevFormData, group: newGroup };
        });
    };
    const [isDropdownOpenTaskType, setIsDropdownOpenTaskType] = useState(false);
    const [isDropdownOpenStatus, setIsDropdownOpenStatus] = useState(false);
    const [isDropdownOpenGroup, setIsDropdownOpenGroup] = useState(false);
    const [isDropdownOpenService, setIsDropdownOpenService] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdownTaskType = () => {
        setIsDropdownOpenTaskType(!isDropdownOpenTaskType);
    };
    const toggleDropdownService = () => setIsDropdownOpenService(!isDropdownOpenService);


    const toggleDropdownStatus = () => {
        setIsDropdownOpenStatus(!isDropdownOpenStatus);
    };

    const toggleDropdownGroup = () => {
        setIsDropdownOpenGroup(!isDropdownOpenGroup);
    };

    const handleTaskTypeSelect = (type) => {
        setFormData({ ...formData, task_type: type });
        setIsDropdownOpenTaskType(false);
    };

    const handleStatusSelect = (status) => {
        setFormData({ ...formData, status: status });
        setIsDropdownOpenStatus(false);
    };
    const handleServiceChange = (serviceType) => {
        setFormData(prevFormData => {
            const newFlags = {
                is_tv: serviceType === 'tv' ? !prevFormData.is_tv : prevFormData.is_tv,
                is_internet: serviceType === 'internet' ? !prevFormData.is_internet : prevFormData.is_internet,
                is_voice: serviceType === 'voice' ? !prevFormData.is_voice : prevFormData.is_voice
            };

            return {
                ...prevFormData,
                ...newFlags
            };
        });
    };

    const renderTaskTypeOptions = () => {
        return TASK_TYPES.map(option => (
            <div
                key={option.value}
                className={`taskType-option ${formData.task_type === option.value ? 'selected' : ''}`}
                onClick={() => handleTaskTypeSelect(option.value)}
            >
                {option.label}
            </div>
        ));
    };

    const renderStatusOptions = () => {
        return STATUS_OPTIONS.map(option => (
            <div
                key={option.value}
                className={`taskType-option ${formData.status === option.value ? 'selected' : ''}`}
                onClick={() => handleStatusSelect(option.value)}
            >
                {option.label}
            </div>
        ));
    };

    const renderServiceOptions = () => {
        return SERVICE_OPTIONS.map(option => (
            <div
                key={option.value}
                className={`taskType-option ${formData[option.value] ? 'selected' : ''}`}
                onClick={() => handleServiceChange(option.value)}
            >
                {option.label}
            </div>
        ));
    };

    const [isAddSurveyModalOpen, setIsAddSurveyModalOpen] = useState(false);

    const openAddSurveyModal = () => {
        setIsAddSurveyModalOpen(true);
    };

    const renderGroups = () => {
        return groups.map((group) => (
            <label key={group.id} className="dropdown-task-item">
                <input
                    type="checkbox"
                    checked={formData.group.includes(group.id)}
                    onChange={() => handleGroupSelect(group.group)}
                />
                {group.group}
            </label>
        ));
    };

    const shouldShowAddSurveyButton = (
        (taskDetails?.is_tv && !taskDetails?.tv) ||
        (taskDetails?.is_internet && !taskDetails?.internet) ||
        (taskDetails?.is_voice && !taskDetails?.voice)
    ) && taskDetails?.status !== 'waiting';

    const handleSurveyAdded = (serviceType, surveyData) => {
        setTaskDetails((prevDetails) => ({
            ...prevDetails,
            [serviceType]: surveyData,
        }));
    };

    const [isUpdateTVModalOpen, setIsUpdateTVModalOpen] = useState(false);
    const [isUpdateInternetModalOpen, setIsUpdateInternetModalOpen] = useState(false);
    const [isUpdateVoiceModalOpen, setIsUpdateVoiceModalOpen] = useState(false);

    const handleServiceUpdate = (serviceType, updatedData) => {
        setTaskDetails((prevDetails) => ({
            ...prevDetails,
            [serviceType]: updatedData,
        }));
    };

    const handleMapClick = (latlng) => {
        if (isEditing) {
            setFormData((prevState) => ({
                ...prevState,
                latitude: latlng.lat,
                longitude: latlng.lng,
            }));
        }
    };
    const customerIcon = new L.Icon({
        iconUrl: 'https://img.icons8.com/?size=100&id=CwAOuD64vULU&format=png&color=000000',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    const renderMap = () => (
        <div className="form-group mapDiv" id='detailMap'>
            <label htmlFor="note"><FaMapPin />
                Müştəri ünvanı:</label>
            <MapContainer
                center={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : [40.4093, 49.8671]}
                zoom={13}
                style={{ height: '300px', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {isEditing && <MapClickHandler onClick={handleMapClick} />}
                {formData.latitude && formData.longitude && (
                    <Marker icon={customerIcon} position={[formData.latitude, formData.longitude]} />
                )}
            </MapContainer>
        </div>
    );
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    useEffect(() => {
        if (isDropdownOpenGroup && groupDropdownRef.current) {
            const rect = groupDropdownRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left,
            });
        }
    }, [isDropdownOpenGroup]);

    if (!taskDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="taskType-modal">
            <div className="taskType-modal-content">
                <div className="taskType-modal-title">
                    {isEditing ? (
                        <div className='details-title'>
                            <label><span>Tapşırığı yenilə </span></label>
                        </div>
                    ) : (
                        <>
                            <h5>{taskDetails?.task_type ? (taskDetails.task_type === "connection" ? "Qoşulma" : "Problem") + " məlumatları" : ""}</h5>
                            {/* {userType !== 'Texnik' && ( */}
                            <RiEdit2Line onClick={handleEditClick} />

                            {/* )} */}
                        </>
                    )}
                    <div>
                        <span className="close" onClick={onClose}>&times;</span>
                    </div>
                </div>
                <hr />
                {isEditing ? (
                    <form onSubmit={handleFormSubmit} className="details-modal-body">
                        <div>
                            <div className="taskType-info details-info">
                                <div>
                                    <div className="status-dropdown-div task-type-select">
                                        <label><SiTyper />
                                            Tapşırığın növü</label>
                                        <div className="dropdown-task" id="details-task" ref={taskTypeDropdownRef}>
                                            <div className="dropdown-task-toggle" onClick={toggleDropdownTaskType}>
                                                {formData.task_type ? formData.task_type === 'connection' ? 'Qoşulma' : 'Problem' : 'Tapşırığı Seçin'}
                                                <FaChevronDown />

                                            </div>
                                        </div>
                                        {isDropdownOpenTaskType && (
                                            <div className="taskType-options">
                                                {renderTaskTypeOptions()}
                                            </div>
                                        )}
                                    </div>
                                    <hr />
                                </div>
                                <div>
                                    <div>
                                        <label><IoPersonOutline /> Müştəri</label>
                                        <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} />
                                    </div>
                                    <hr />
                                </div>
                                <div>
                                    <div>
                                        <label><GoClock /> Tarix</label>
                                        <input type="date" id="" name="date" value={formData.date} onChange={handleInputChange} />
                                    </div>
                                    <hr />
                                </div>
                                <div>
                                    <div>
                                        <label><GoClock /> Saat</label>
                                        <div className='taskDetailTime'> <input type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} />
                                            <input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <hr />
                                </div>
                                <div>
                                    <div>
                                        <label><BsTelephone /> Qeydiyyat nömrəsi</label>
                                        <input type="text" name="registration_number" value={formData.registration_number} onChange={handleInputChange} />
                                    </div>
                                    <hr />
                                </div>
                                <div>
                                    <div>
                                        <label><LiaPhoneVolumeSolid /> Əlaqə nömrəsi</label>
                                        <input type="text" name="contact_number" value={formData.contact_number} onChange={handleInputChange} />
                                    </div>
                                    <hr />
                                </div>
                                <div>
                                    <div>
                                        <label><RiMapPinLine /> Adres</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
                                    </div>
                                    <hr />
                                </div>
                                <div>
                                    <div className='status-dropdown-div'>
                                        <label><MdOutlineMiscellaneousServices /> Xidmət</label>
                                        <div className="status-dropdown" ref={serviceDropdownRef}>
                                            <div
                                                className="taskType-toggle details-toggle"
                                                onClick={toggleDropdownService}
                                            >
                                                {formData.is_tv || formData.is_internet || formData.is_voice
                                                    ? SERVICE_OPTIONS.filter(option =>
                                                        (option.value === 'tv' && formData.is_tv) ||
                                                        (option.value === 'internet' && formData.is_internet) ||
                                                        (option.value === 'voice' && formData.is_voice)
                                                    ).map(service => service.label).join(', ')
                                                    : 'Xidmət seçin'}
                                                <FaChevronDown />
                                            </div>

                                            {isDropdownOpenService && (
                                                <div className="taskType-options">
                                                    {renderServiceOptions()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <hr />
                                </div>
                                <div>
                                    <div className='status-dropdown-div'>
                                        <label><BiComment /> Status</label>
                                        <div className="status-dropdown" ref={statusDropdownRef}>
                                            <div className="taskType-toggle details-toggle" onClick={toggleDropdownStatus}>
                                                {formData.status ? STATUS_OPTIONS.find(option => option.value === formData.status)?.label : 'Status Seçin'}
                                                <FaChevronDown />

                                            </div>
                                            {isDropdownOpenStatus && (
                                                <div className="taskType-options">
                                                    {renderStatusOptions()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <hr />
                                </div>
                                <div>
                                    <div className="form-group">
                                        <label><MdOutlineEngineering /> Texniki qrup</label>
                                        <div className="dropdown-task" id='details-task' ref={groupDropdownRef}>
                                            <div
                                                className="dropdown-task-toggle"
                                                onClick={() => setIsDropdownOpenGroup(!isDropdownOpenGroup)}
                                            >
                                                {formData.group.length > 0
                                                    ? `${formData.group.join(', ')}`
                                                    : 'Qrup Seçin'}
                                                <FaChevronDown />
                                            </div>
                                            {isDropdownOpenGroup && (
                                                <div
                                                    className="dropdown-task-menu"
                                                    style={{
                                                        position: 'absolute',
                                                        top: dropdownPosition.top,
                                                        left: dropdownPosition.left,
                                                    }}
                                                >
                                                    {renderGroups()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <hr />

                                </div>

                            </div>
                            {renderMap()}
                            <div className="taskType-note details-note">
                                <div>
                                    <label>Qeyd</label>
                                    <textarea name="note" value={formData.note} onChange={handleInputChange}></textarea>
                                </div>
                                <hr />
                            </div>
                            <div className="form-group passportUpdate">
                                <label>Müştərinin şəxsiyyət vəsiqəsi:</label>
                                <div className="upload-container">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="image-preview"
                                        />
                                    ) : (
                                        taskDetails && taskDetails.passport ? (
                                            <img
                                                src={taskDetails.passport}
                                                alt="Current Passport"
                                                className="image-preview"
                                            />
                                        ) : (
                                            <label htmlFor="passport" className="upload-label">
                                                <span>Yükləmək üçün klikləyin</span>
                                                <div className="upload-icon">
                                                    <img src={upload} alt="Upload Icon" />
                                                </div>
                                            </label>
                                        )
                                    )}

                                    <div>
                                        <input
                                            type="file"
                                            id="passport"
                                            name="passport"
                                            accept="image/*"
                                            onChange={handleInputPhotoChange}
                                            style={{ display: 'none' }}
                                        />

                                        {(preview || taskDetails?.passport) && (
                                            <label htmlFor="passport" className="upload-button upload-passport-button">
                                                {preview ? "Şəkli dəyişin" : "Yükləmək üçün klikləyin"}
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button className='updateTask-button' type="submit">Yenilə</button>
                        </div>
                    </form>
                ) : (
                    <div className="taskType-modal-body">
                        <div className="taskType-info">
                            <div>
                                <div>
                                    <label><IoPersonOutline /> Müştəri</label>
                                    <span>{taskDetails.full_name}</span>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div>
                                    <label><IoPersonOutline /> İcraçı</label>
                                    <span>{taskDetails.first_name} {taskDetails.last_name}</span>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div>
                                    <label><GoClock /> Zaman</label>
                                    {taskDetails.date && (
                                        <span>{`${taskDetails.date.split('-')[2]} ${monthNames[parseInt(taskDetails.date.split('-')[1], 10) - 1]}${taskDetails.start_time && taskDetails.end_time
                                            ? `, ${formatTime(taskDetails.start_time)} - ${formatTime(taskDetails.end_time)}`
                                            : (!taskDetails.start_time && !taskDetails.end_time)
                                                ? ""
                                                : `${taskDetails.start_time ? formatTime(taskDetails.start_time) : "-"} - ${taskDetails.end_time ? formatTime(taskDetails.end_time) : "-"}`}`}</span>
                                    )}
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div className='registrationNumber'>
                                    <label><BsTelephone /> Qeydiyyat nömrəsi</label>
                                    <span>{taskDetails.registration_number}</span>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div className='taskType-phone'>
                                    <label><LiaPhoneVolumeSolid /> Əlaqə nömrəsi</label>
                                    <span>{taskDetails.contact_number}</span>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div>
                                    <label><MdOutlineMiscellaneousServices /> Xidmət</label>
                                    <span className="type-icon">
                                        {taskDetails.is_tv && <PiTelevisionSimple />}
                                        {taskDetails.is_internet && <TfiWorld />}
                                        {taskDetails.is_voice && <RiVoiceprintFill />}
                                        {!taskDetails.is_tv && !taskDetails.is_internet && !taskDetails.is_voice && <span>-</span>}
                                    </span>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div className='taskType-status'>
                                    <label><BiComment /> Status</label>
                                    <span>{taskDetails.status}</span>
                                </div>
                                <hr />
                            </div>
                            <div>
                                <div>
                                    <label><MdOutlineEngineering /> Texniki qrup</label>
                                    <div>
                                        {taskDetails.group && taskDetails.group.length > 0 ? (
                                            taskDetails.group.map((group, index) => (
                                                <div key={index}>
                                                    <span>{group.group}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span>Texniki qrup seçilməyib.</span>
                                        )}
                                    </div>
                                </div>
                                <hr />
                            </div>

                            <div>
                                <div className='taskType-address'>
                                    <label><RiMapPinLine /> Adres</label>
                                    <span>{taskDetails.location}</span>
                                </div>
                                <hr />
                            </div>
                            {taskDetails.passport &&
                                <div>
                                    <div className='taskType-photo'>
                                        <label><FaPassport /> Müştərinin şəxsiyyət vəsiqəsi</label>
                                        <img src={taskDetails.passport} alt="" />
                                    </div>
                                    <hr />
                                </div>
                            }
                        </div>
                        {
                            formData.latitude != null && formData.longitude != null ?
                                renderMap() : ''
                        }
                        <div className="taskType-note">
                            <div>
                                <label>Qeyd</label>
                                <span>{taskDetails.note}</span>
                            </div>
                            <hr />
                        </div>

                        <div className="service-details">
                            {taskDetails.is_tv && taskDetails.tv && (
                                <div className="service-detail">
                                    <h5>Tv xidməti<span>
                                        {/* {isAdmin && ( */}
                                        <MdOutlineEdit onClick={() => setIsUpdateTVModalOpen(true)} />
                                        {/* )} */}
                                    </span></h5>
                                    <hr />
                                    <div>
                                        <div>
                                            {taskDetails.tv.photo_modem ?
                                                <div className="detail-item">
                                                    <label>Modemin şəkli:</label>
                                                    <img src={taskDetails.tv.photo_modem || '-'} alt="" />
                                                </div>
                                                : <span>Şəkil əlavə olunmayıb</span>}
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Modem Serial Nömrəsi:</label>
                                                <span>{taskDetails.tv.modem_SN || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Rg6 Kabel:</label>
                                                <span>{taskDetails.tv.rg6_cable || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>F Connector:</label>
                                                <span>{taskDetails.tv.f_connector || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Splitter:</label>
                                                <span>{taskDetails.tv.splitter || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {taskDetails.is_internet && taskDetails.internet && (
                                <div className="service-detail">
                                    <h5>İnternet xidməti <span>
                                        {/* {isAdmin && ( */}
                                        <MdOutlineEdit onClick={() => setIsUpdateInternetModalOpen(true)} />
                                        {/* )} */}
                                    </span></h5>
                                    <hr />
                                    <div>
                                        <div>
                                            {taskDetails.internet.photo_modem ?
                                                <div className="detail-item">
                                                    <label>Modemin şəkli:</label>
                                                    <img src={taskDetails.internet.photo_modem || '-'} alt="" />
                                                </div>
                                                : <span>Şəkil əlavə olunmayıb</span>}
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Modem Serial Nömrəsi:</label>
                                                <span>{taskDetails.internet.modem_SN || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Optik Kabel:</label>
                                                <span>{taskDetails.internet.optical_cable || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Fastconnector:</label>
                                                <span>{taskDetails.internet.fastconnector || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Siqnal:</label>
                                                <span>{taskDetails.internet.siqnal || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>İnternet tarifi:</label>
                                                <span>{taskDetails.internet.internet_packs || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {taskDetails.is_voice && taskDetails.voice && (
                                <div className="service-detail">
                                    <h5>Səs xidməti <span>
                                        {/* {isAdmin && ( */}
                                        <MdOutlineEdit onClick={() => setIsUpdateVoiceModalOpen(true)} />
                                        {/* )} */}
                                    </span></h5>
                                    <hr />
                                    <div>
                                        <div>
                                            {taskDetails.voice.photo_modem ?
                                                <div className="detail-item">
                                                    <label>Modemin şəkli:</label>
                                                    <img src={taskDetails.voice.photo_modem || '-'} alt="" />
                                                </div>
                                                : <span>Şəkil əlavə olunmayıb</span>}
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Modem Serial Nömrəsi:</label>
                                                <span>{taskDetails.voice.modem_SN || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Ev Nömrəsi:</label>
                                                <span>{taskDetails.voice.home_number || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Şifrə:</label>
                                                <span>{taskDetails.voice.password || '-'}</span>
                                            </div>
                                            <hr />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* {userType === 'Texnik' && shouldShowAddSurveyButton && ( */}
                        {shouldShowAddSurveyButton && (
                            <button
                                className="add-survey-button"
                                onClick={openAddSurveyModal}
                            >
                                <p>Anket əlavə et</p>
                                <MdAdd />
                            </button>
                        )}

                    </div>
                )}
            </div>
            {
                isAddSurveyModalOpen && (
                    <AddSurveyModal
                        onClose={() => setIsAddSurveyModalOpen(false)}
                        selectedServices={{
                            tv: taskDetails.is_tv,
                            internet: taskDetails.is_internet,
                            voice: taskDetails.is_voice
                        }}
                        taskId={taskId}
                        initialAddedServices={addedServices}
                        onSurveyAdded={handleSurveyAdded}
                    />
                )
            }
            {
                isUpdateTVModalOpen && (
                    <UpdateTVModal
                        onClose={() => setIsUpdateTVModalOpen(false)}
                        serviceId={taskDetails.tv.id}
                        serviceData={taskDetails.tv}
                        onServiceUpdate={handleServiceUpdate}
                    />
                )
            }
            {
                isUpdateInternetModalOpen && (
                    <UpdateInternetModal
                        onClose={() => setIsUpdateInternetModalOpen(false)}
                        serviceId={taskDetails.internet.id}
                        serviceData={taskDetails.internet}
                        onServiceUpdate={handleServiceUpdate}
                    />
                )
            }
            {
                isUpdateVoiceModalOpen && (
                    <UpdateVoiceModal
                        onClose={() => setIsUpdateVoiceModalOpen(false)}
                        serviceId={taskDetails.voice.id}
                        serviceData={taskDetails.voice}
                        onServiceUpdate={handleServiceUpdate}
                    />
                )
            }
        </div >
    );
}

export default DetailsModal;
