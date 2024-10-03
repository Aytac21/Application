import { useState, useEffect, useRef } from 'react';
import { IoMdRefresh } from "react-icons/io";
import { IoAdd } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa6";
import { PiTelevisionSimple } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { RiVoiceprintFill } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import AddTaskModal from '../../components/AddTaskModal';
import AddSurveyModal from '../../components/AddSurveyModal';
import { RiDeleteBin6Line } from "react-icons/ri";
import DetailsModal from '../../components/TaskType';
import { MdOutlineEdit } from "react-icons/md";
import './tasks.css';
import axios from "axios";

const refreshAccessToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
        throw new Error('No refresh token available');
    }

    const response = await axios.post('http://135.181.42.192/accounts/token/refresh/', { refresh: refresh_token });
    const { access } = response.data;
    localStorage.setItem('access_token', access);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
};

function Index() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("Hamısı");
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isSmallModalOpen, setIsSmallModalOpen] = useState(false);
    const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [userType, setUserType] = useState(null);
    const [userPhone, setUserPhone] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const modalRef = useRef(null);

    useEffect(() => {
        const storedUserType = localStorage.getItem('user_type') || sessionStorage.getItem('user_type');
        const storedUserPhone = localStorage.getItem('phone') || sessionStorage.getItem('phone');
        setUserType(storedUserType);
        setUserPhone(storedUserPhone);

        fetchTasks(selectedMonth, selectedYear, "Hamısı", activeFilter);
    }, [selectedMonth, selectedYear, activeFilter, selectedStatusFilter]);

    const statusRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                closeSmallModal();
            }
            if (statusRef.current && !statusRef.current.contains(event.target)) {
                setIsStatusModalOpen(false);
            }
        }

        function handleScroll() {
            if (isSmallModalOpen && selectedTaskIndex !== null) {
                const button = document.querySelector(`[data-task-index="${selectedTaskIndex}"]`);
                if (button) {
                    const buttonRect = button.getBoundingClientRect();
                    setModalPosition({
                        top: buttonRect.top + window.scrollY,
                        left: buttonRect.left + buttonRect.width
                    });
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isSmallModalOpen, selectedTaskIndex]);

    const monthsAz = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
        "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
    ];

    const fetchTasks = async (taskFilter, selectedMonth, selectedYear, statusFilter, activeFilter) => {
        if (!selectedMonth) return;

        try {
            const token = localStorage.getItem('access_token');
            const month = selectedMonth.getMonth() + 1;
            const year = selectedYear;
            const monthQueryParam = `&month=${month}&year=${year}`;
            const statusMap = {
                "Hamısı": "",
                "Gözləyir": "waiting",
                "Qəbul edilib": "inprogress",
                "Başlanıb": "started",
                "Tamamlanıb": "completed",
                "Tamamlanmadı": "not_completed"
            };

            const taskTypeParam = taskFilter !== "all" ? `&task_type=${taskFilter}` : "";
            const statusParam = statusFilter !== "Hamısı" ? `&status=${statusMap[statusFilter]}` : "";

            const url = `http://135.181.42.192/services/status/?${taskTypeParam}${monthQueryParam}${statusParam}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await refreshAccessToken();

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setData(sortedData);
            setFilteredData(sortedData);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleMonthChange = (change) => {
        const newDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + change);
        setSelectedMonth(newDate);
        setSelectedYear(newDate.getFullYear());
        // setActiveFilter(taskFilter);
        setSelectedStatusFilter(selectedStatusFilter);
        fetchTasks(activeFilter, newDate, newDate.getFullYear(), selectedStatusFilter);
    };

    const applyFilters = (taskFilter, selectedMonth, selectedYear, selectedStatusFilter) => {
        setActiveFilter(taskFilter);
        setSelectedMonth(selectedMonth);
        setSelectedYear(selectedYear);
        setSelectedStatusFilter(selectedStatusFilter);
        fetchTasks(taskFilter, selectedMonth, selectedYear, selectedStatusFilter, activeFilter);
    };

    const filterData = (filter) => {
        applyFilters(filter, selectedMonth, selectedYear, selectedStatusFilter, activeFilter);
        setActiveFilter(filter);
    };

    const filterByStatus = (statusFilter) => {
        setIsStatusModalOpen(false);
        setSelectedStatusFilter(selectedStatusFilter);
        applyFilters(activeFilter, selectedMonth, selectedYear, statusFilter);
    };

    const openAddTaskModal = () => {
        setIsAddTaskModalOpen(true);
    };

    const closeAddTaskModal = () => {
        setIsAddTaskModalOpen(false);
    };

    const formatTime = (time) => {
        if (!time) return "-";

        const date = new Date(`1970-01-01T${time}Z`);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
    };

    const openSmallModal = (event, index) => {
        const buttonRect = event.target.getBoundingClientRect();
        setSelectedTaskIndex(index);
        setIsSmallModalOpen(true);
    };

    const closeSmallModal = () => {
        setIsSmallModalOpen(false);
    };

    const openTaskDetailsModal = (taskId) => {
        setSelectedTaskId(taskId);
        setIsSmallModalOpen(false);
        setIsTaskDetailsModalOpen(true);
    };

    const closeTaskDetailsModal = () => {
        setIsTaskDetailsModalOpen(false);
    };

    const [isAddSurveyModalOpen, setIsAddSurveyModalOpen] = useState(false);

    const openAddSurveyModal = () => {
        setIsTaskDetailsModalOpen(false);
        setIsAddSurveyModalOpen(true);
    };

    const closeAddSurveyModal = () => {
        setIsAddSurveyModalOpen(false);
    };

    const resetFilters = () => {
        setActiveFilter("all");
        const currentDate = new Date();
        setSelectedMonth(currentDate);
        setSelectedYear(currentDate.getFullYear());
        setSelectedStatusFilter("Hamısı");
        fetchTasks("all", currentDate, currentDate.getFullYear(), "Hamısı");
    };

    const deleteTask = async (taskId) => {
        try {
            const token = localStorage.getItem('access_token');
            await fetch(`http://135.181.42.192/services/task/${taskId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFilteredData(prevData => prevData.filter(task => task.id !== taskId));
            fetchTasks(activeFilter, selectedMonth, selectedYear, selectedStatusFilter);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://135.181.42.192/services/task/${taskId}/update/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setFilteredData(prevData =>
                    prevData.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
                );

                const updatedTaskResponse = await fetch(`http://135.181.42.192/services/task/${taskId}/`);
                const updatedTaskData = await updatedTaskResponse.json();

                setFilteredData(prevData =>
                    prevData.map(task => task.id === taskId ? { ...task, first_name: updatedTaskData.first_name, last_name: updatedTaskData.last_name } : task)
                );
            } else {
                console.error('Error updating task status:', response.status);
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const handleNewTask = (newTask) => {
        setData(prevTasks => [newTask, ...prevTasks]);
        setFilteredData(prevTasks => [newTask, ...prevTasks]);
    };

    const handleTaskUpdated = (updatedTask) => {
        setData(prevTasks =>
            prevTasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
            )
        );
    };


    const showUpdateButtons = (userType, status) => {
        if (userType === 'Texnik') {
            if (status === 'waiting') {
                return 'qebul_et';
            } else if (status === 'inprogress') {
                return 'yolda';
            } else if (status === 'started') {
                return 'basla';
            } else if (status === 'completed') {
                return 'tamamlandi';
            }
        }
        return null;
    }

    useEffect(() => {
        fetchTasks(activeFilter, selectedMonth, selectedYear, selectedStatusFilter);
    }, [activeFilter, selectedMonth, selectedYear, selectedStatusFilter]);

    return (
        <div className='task-page'>
            <div className='task-page-title'>
                <p>Tapşırıqlar</p>
                <div>
                    <button onClick={resetFilters}>
                        <IoMdRefresh />Yenilə
                    </button>
                    {userType !== 'Texnik' && (
                        <button onClick={openAddTaskModal}><IoAdd />Əlavə et</button>
                    )}
                </div>
            </div>

            <div className="taskPage-taskType">
                <button className={activeFilter === "all" ? "activeButton" : ""} onClick={() => filterData("all")}>Hamısı</button>
                <button className={activeFilter === "connection" ? "activeButton" : ""} onClick={() => filterData("connection")}>Qoşulmalar</button>
                <button className={activeFilter === "problem" ? "activeButton" : ""} onClick={() => filterData("problem")}>Problemlər</button>
            </div>
            <div className="task-history-status">
                <button onClick={() => setIsDateModalOpen(!isDateModalOpen)}>
                    <div onClick={(e) => { e.stopPropagation(); handleMonthChange(-1); }}>
                        <span>&lt;</span>
                    </div>
                    <p>{`${monthsAz[selectedMonth.getMonth()]}, ${selectedYear}`}</p>
                    <div onClick={(e) => { e.stopPropagation(); handleMonthChange(1); }}>
                        <span>&gt;</span>
                    </div>
                </button>
                <button onClick={() => setIsStatusModalOpen(!isStatusModalOpen)}>
                    <span>Status:</span>
                    <span>{selectedStatusFilter}</span>
                    <FaChevronDown />
                </button>
                {isStatusModalOpen && (
                    <div className="status-modal" ref={statusRef}>
                        <div onClick={() => filterByStatus("Hamısı")}>Hamısı</div>
                        <div onClick={() => filterByStatus("Gözləyir")}>Gözləyir</div>
                        <div onClick={() => filterByStatus("Qəbul edilib")}>Qəbul edilib</div>
                        <div onClick={() => filterByStatus("Başlanıb")}>Başlanıb</div>
                        <div onClick={() => filterByStatus("Tamamlanıb")}>Tamamlanıb</div>
                        <div onClick={() => filterByStatus("Tamamlanmadı")}>Tamamlanmadı</div>
                    </div>
                )}
            </div>
            <div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>İcraçı</th>
                                <th>Müştəri</th>
                                <th>Kateqoriya</th>
                                <th>Tarix</th>
                                <th>Saat</th>
                                <th>Növ</th>
                                <th>Ünvan</th>
                                <th>Nömrə</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td onClick={() => openTaskDetailsModal(item.id)} className={item.id}>{`#${(index + 1).toString().padStart(4, '0')}`}</td>
                                    <td onClick={() => openTaskDetailsModal(item.id)}>{item.first_name && item.last_name ? `${item.first_name} ${item.last_name.charAt(0)}.` : '-'}</td>
                                    <td onClick={() => openTaskDetailsModal(item.id)}>{item.full_name}</td>
                                    <td onClick={() => openTaskDetailsModal(item.id)} className={item.task_type === 'problem' ? 'problem' : 'connection'}>
                                        {item.task_type === 'problem' ? 'Problem' : 'Qoşulma'}
                                    </td>
                                    <td onClick={() => openTaskDetailsModal(item.id)}>{item.date}</td>
                                    <td onClick={() => openTaskDetailsModal(item.id)}>
                                        {item.start_time && item.end_time
                                            ? `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`
                                            : (!item.start_time && !item.end_time)
                                                ? "-"
                                                : `${item.start_time ? formatTime(item.start_time) : "-"} - ${item.end_time ? formatTime(item.end_time) : "-"}`}
                                    </td>
                                    <td onClick={() => openTaskDetailsModal(item.id)} className="type-icon">
                                        {item.is_tv && <PiTelevisionSimple />}
                                        {item.is_internet && <TfiWorld />}
                                        {item.is_voice && <RiVoiceprintFill />}
                                        {!item.is_tv && !item.is_internet && !item.is_voice && <span>-</span>}
                                    </td>

                                    <td onClick={() => openTaskDetailsModal(item.id)}>{item.location}</td>
                                    <td onClick={() => openTaskDetailsModal(item.id)}>{item.contact_number ? item.contact_number : 'No Number'}</td>
                                    <td className="task-status">
                                        {userType === 'Texnik' || item.phone === userPhone && !item.phone ? (
                                            <>
                                                {item.status === "waiting" && (
                                                    <button className={`texnikWaiting ${showUpdateButtons(userType, item.status)}`} onClick={() => handleStatusUpdate(item.id, 'inprogress')}>Qəbul et</button>
                                                )}
                                                {item.status === "inprogress" && (
                                                    <button className={`texnikStatus ${showUpdateButtons(userType, item.status)}`} onClick={() => handleStatusUpdate(item.id, 'started')}>Başla</button>
                                                )}
                                                {item.status === "started" && (
                                                    <button className={`texnikStatus ${showUpdateButtons(userType, item.status)}`} onClick={() => handleStatusUpdate(item.id, 'completed')}>Tamamla</button>
                                                )}
                                                {item.status === "completed" && (
                                                    <button className={`texnikCompleted ${showUpdateButtons(userType, item.status)}`}>Tamamlandı</button>
                                                )}
                                            </>
                                        ) : (
                                            <button onClick={() => openTaskDetailsModal(item.id)} className={`status ${item.status.toLowerCase().replace(' ', '-')}`}>
                                                {item.status === "waiting" ? "Gözləyir" :
                                                    item.status === "inprogress" ? "Qəbul edilib" :
                                                        item.status === "started" ? "Başlanıb" :
                                                            item.status === "completed" ? "Tamamlanıb" : item.status}
                                            </button>
                                        )}
                                    </td>

                                    <td>
                                        {userType !== 'Texnik' ? (
                                            <>
                                                <button data-task-index={index} onClick={(e) => openSmallModal(e, index)}><BsThreeDotsVertical /></button>
                                                {isSmallModalOpen && selectedTaskIndex === index && (
                                                    <div
                                                        ref={modalRef}
                                                        className={`small-modal ${isSmallModalOpen ? 'active' : ''}`}
                                                    >
                                                        <div className="small-modal-content">
                                                            <button onClick={() => deleteTask(item.id)}>
                                                                <RiDeleteBin6Line />
                                                            </button>
                                                            <button onClick={() => openTaskDetailsModal(item.id)}>
                                                                <MdOutlineEdit />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isAddTaskModalOpen && <AddTaskModal onClose={closeAddTaskModal} onTaskCreated={handleNewTask} />}
            {isTaskDetailsModalOpen && (
                <DetailsModal
                    onClose={closeTaskDetailsModal}
                    onAddSurveyClick={openAddSurveyModal}
                    onTaskUpdated={handleTaskUpdated}
                    taskId={selectedTaskId} userType={userType}
                />
            )}
            {isAddSurveyModalOpen && <AddSurveyModal onClose={closeAddSurveyModal} />}

        </div>
    );
}

export default Index;
