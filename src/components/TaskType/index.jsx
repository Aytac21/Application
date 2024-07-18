import React, { useState, useEffect, useRef } from 'react';
import { RiEdit2Line } from "react-icons/ri";
import { IoPersonOutline } from "react-icons/io5";
import { BsTelephone } from "react-icons/bs";
import { GoClock } from "react-icons/go";
import { CiMapPin } from "react-icons/ci";
import { LiaPhoneVolumeSolid } from "react-icons/lia";
import { RiMapPinLine } from "react-icons/ri";
import { MdOutlineMiscellaneousServices } from "react-icons/md";
import { BiComment } from "react-icons/bi";
import { MdOutlineEngineering } from "react-icons/md";
import './detailsModal.css';
import { FaChevronDown } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import AddSurveyModal from '../AddSurveyModal';
import { PiTelevisionSimple } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { RiVoiceprintFill } from "react-icons/ri";
import { MdOutlineEdit } from "react-icons/md";
import { SiTyper } from "react-icons/si";
import UpdateTVModal from '../UpdateTVModal';
import UpdateInternetModal from '../UpdateInternetModal';
import UpdateVoiceModal from '../UpdateVoiceModal';
import { useUser } from '../../contexts/UserContext';


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



function DetailsModal({ onClose, taskId, userType, onAddSurveyClick }) {
    const { isAdmin } = useUser();

    const [taskDetails, setTaskDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [groups, setGroups] = useState([]);

    const taskTypeDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);
    const serviceDropdownRef = useRef(null);
    const groupDropdownRef = useRef(null);
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
        time: '',
        registration_number: '',
        contact_number: '',
        location: '',
        services: [],
        status: '',
        group: [],
        note: '',
        is_tv: "",
        is_internet: "",
        is_voice: ""

    });

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
                        time: data.time,
                        registration_number: data.registration_number,
                        contact_number: data.contact_number,
                        location: data.location,
                        services: data.services,
                        status: data.status,
                        group: data.group.map(g => g.id),
                        note: data.note,
                        is_tv: data.is_tv,
                        is_voice: data.is_voice,
                        is_internet: data.is_internet
                    });
                })
                .catch(error => console.error('Error fetching task details:', error));
        }

        fetch('http://135.181.42.192/services/groups/')
            .then(response => response.json())
            .then(data => setGroups(data))
            .catch(error => console.error('Error fetching groups:', error));
    }, [taskId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const [addedServices, setAddedServices] = useState([]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        console.log("formData:", formData);

        const updatedData = {};
        Object.keys(formData).forEach(key => {
            if (formData[key] !== taskDetails[key]) {
                updatedData[key] = formData[key];
            }
        });


        if (updatedData.id) {
            updatedData.id = formData.id;
        }

        fetch(`http://135.181.42.192/services/update_task/${taskId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)

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
                setIsEditing(false);
                onClose();
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
            const updatedServices = (prevFormData.services || []).includes(serviceType)
                ? prevFormData.services.filter(service => service !== serviceType)
                : [...(prevFormData.services || []), serviceType];
            return { ...prevFormData, services: updatedServices };
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
                className={`taskType-option ${formData.services?.includes(option.value) ? 'selected' : ''}`}
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
                    onChange={() => handleGroupSelect(group.id)}
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

    const getAddedServices = (taskDetails) => {
        const services = [];
        if (taskDetails.is_tv) services.push('TV');
        if (taskDetails.is_internet) services.push('Internet');
        if (taskDetails.is_voice) services.push('Voice');
        return services;
    };


    if (!taskDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="taskType-modal">
            <div className="taskType-modal-content">
                <div className="taskType-modal-title">
                    {isEditing ? (
                        <div className='details-title'>
                            <label><span>Tapşırığın Növü </span></label>
                        </div>
                    ) : (
                        <h5>{taskDetails?.task_type ? (taskDetails.task_type === "connection" ? "Qoşulma" : "Problem") + " məlumatları" : ""}</h5>
                    )}
                    <div>
                        {userType !== 'Texnik' && (
                            <RiEdit2Line onClick={handleEditClick} />

                        )}
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
                                        <div class="dropdown-task" id="details-task" ref={taskTypeDropdownRef}>
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
                                        <label><GoClock /> Zaman</label>
                                        <input type="text" name="time" value={formData.time} onChange={handleInputChange} />
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
                                                {Array.isArray(formData.services) && formData.services.length > 0
                                                    ? formData.services
                                                        .map(service => SERVICE_OPTIONS.find(option => option.value === service)?.label)
                                                        .join(', ')
                                                    : 'Xidmət seçin'}                                                <FaChevronDown />
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
                                                    ? `Qrup ${formData.group.join(', Qrup ')}`
                                                    : 'Qrup Seçin'}
                                                <FaChevronDown />
                                            </div>
                                            {isDropdownOpenGroup && (
                                                <div className="dropdown-task-menu">
                                                    {renderGroups()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <hr />

                                </div>

                            </div>
                            <div className="taskType-note details-note">
                                <div>
                                    <label>Qeyd</label>
                                    <textarea name="note" value={formData.note} onChange={handleInputChange}></textarea>
                                </div>
                                <hr />
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
                                    <label><GoClock /> Zaman</label>
                                    {taskDetails.date && (
                                        <span>{`${taskDetails.date.split('-')[2]} ${monthNames[parseInt(taskDetails.date.split('-')[1], 10) - 1]}, ${taskDetails.time}`}</span>
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
                                <hr />
                            </div>

                            <div>
                                <div className='taskType-address'>
                                    <label><RiMapPinLine /> Adres</label>
                                    <span>{taskDetails.location}</span>
                                </div>
                                <hr />
                            </div>
                        </div>
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
                                        {isAdmin && (
                                            <MdOutlineEdit onClick={() => setIsUpdateTVModalOpen(true)} />
                                        )}
                                    </span></h5>
                                    <hr />
                                    <div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Modemin şəkli:</label>
                                                <img src={taskDetails.tv.photo_modem || '-'} alt="" />
                                            </div>
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
                                        {isAdmin && (
                                            <MdOutlineEdit onClick={() => setIsUpdateInternetModalOpen(true)} />
                                        )}
                                    </span></h5>
                                    <hr />
                                    <div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Modemin şəkli:</label>
                                                <img src={taskDetails.internet.photo_modem || '-'} alt="" />
                                            </div>
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
                                    </div>
                                </div>
                            )}
                            {taskDetails.is_voice && taskDetails.voice && (
                                <div className="service-detail">
                                    <h5>Səs xidməti <span>
                                        {isAdmin && (
                                            <MdOutlineEdit onClick={() => setIsUpdateVoiceModalOpen(true)} />
                                        )}
                                    </span></h5>
                                    <hr />
                                    <div>
                                        <div>
                                            <div className="detail-item">
                                                <label>Modemin şəkli:</label>
                                                <img src={taskDetails.voice.photo_modem || '-'} alt="" />
                                            </div>
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

                        {userType === 'Texnik' && shouldShowAddSurveyButton && (

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
            {isAddSurveyModalOpen && (
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
            )}
            {isUpdateTVModalOpen && (
                <UpdateTVModal
                    onClose={() => setIsUpdateTVModalOpen(false)}
                    serviceId={taskDetails.tv.id}
                    serviceData={taskDetails.tv}
                    onServiceUpdate={handleServiceUpdate}
                />
            )}
            {isUpdateInternetModalOpen && (
                <UpdateInternetModal
                    onClose={() => setIsUpdateInternetModalOpen(false)}
                    serviceId={taskDetails.internet.id}
                    serviceData={taskDetails.internet}
                    onServiceUpdate={handleServiceUpdate}
                />
            )}
            {isUpdateVoiceModalOpen && (
                <UpdateVoiceModal
                    onClose={() => setIsUpdateVoiceModalOpen(false)}
                    serviceId={taskDetails.voice.id}
                    serviceData={taskDetails.voice}
                    onServiceUpdate={handleServiceUpdate}
                />
            )}
        </div>
    );
}

export default DetailsModal;
