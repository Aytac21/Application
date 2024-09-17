import { useState, useEffect } from "react";
import axios from "axios";
import "./home.css";
import { Link, useNavigate } from "react-router-dom";
import { GoClock } from "react-icons/go";
import { IoIosAddCircleOutline } from "react-icons/io";
import ApexChart from "../../components/Chart";
import CircleChart from "../../components/CircleChart";
import AddEventModal from "../../components/AddEventModal";
import { PiTelevisionSimple } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { RiVoiceprintFill } from "react-icons/ri";
import photo1 from "../../assets/images/photo.svg";
import MeetingDetailModal from "../../components/MeetingDetailModal";

async function refreshAccessToken() {
    try {
        const response = await fetch('http://135.181.42.192/accounts/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refreshToken: localStorage.getItem('refreshToken'),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
    }
}

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [userType, setUserType] = useState(null);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchData = async (isRetry = false) => {
        try {
            const token = localStorage.getItem("access_token");

            const responseMainPage = await axios.get(
                "http://135.181.42.192/services/mainpage/",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setMeetings(responseMainPage.data.meetings || []);
            setUserType(responseMainPage.data.user_type);

            const completedTasks = responseMainPage.data.completed_tasks || [];
            const mappedTasks = completedTasks.map((task) => ({
                id: task.id,
                first_name: task.first_name,
                last_name: task.last_name,
                start_time: task.start_time,
                end_time: task.end_time,
                tv: task.is_tv,
                internet: task.is_internet,
                voice: task.is_voice,
                location: task.location,
                phone: task.contact_number,
                status: task.status,
            }));
            setTasks(mappedTasks);

            const responsePerformance = await axios.get(
                "http://135.181.42.192/services/performance/",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setPerformanceData(responsePerformance.data);
        } catch (error) {
            if (
                error.response &&
                (error.response.status === 401 || error.response.status === 403) &&
                !isRetry
            ) {
                try {
                    await refreshAccessToken();
                    await fetchData(true);
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    navigate("/login");
                }
            } else {
                console.error("Error fetching data:", error);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatTime = (time) => {
        if (!time) return "-";

        const date = new Date(`1970-01-01T${time}Z`);
        const hours = date.getUTCHours().toString().padStart(2, "0");
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");

        return `${hours}:${minutes}`;
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleEventAdded = (newEvent) => {
        setMeetings((prevMeetings) => [newEvent, ...prevMeetings]);
    };

    const openMeetingDetailModal = (meetingId) => {
        setSelectedMeeting(meetingId);
        setIsMeetingModalOpen(true);
    };

    const closeMeetingDetailModal = () => {
        setIsMeetingModalOpen(false);
        setSelectedMeeting(null);
    };

    return (
        <div className="home-page">
            <section className="home-meet-section">
                {meetings.map((meeting) => (
                    <div
                        key={meeting.id}
                        className="meet-time-date-img"
                        onClick={() => openMeetingDetailModal(meeting.id)}
                    >
                        <div className="meet-time-date">
                            <p>
                                <GoClock /> {new Date(meeting.date).toLocaleString()}
                            </p>
                            <div>
                                <h5>{meeting.title}</h5>
                                <p>
                                    {meeting.meeting_description.length > 15
                                        ? `${meeting.meeting_description.slice(0, 15)}...`
                                        : meeting.meeting_description}
                                </p>
                            </div>
                        </div>
                        <div className="meet-img">
                            <img src={photo1} alt="Meeting" />
                        </div>
                    </div>
                ))}
                {userType !== "Texnik" && (
                    <div className="meet-add" onClick={openModal}>
                        <button>
                            <IoIosAddCircleOutline />
                            <p>Tədbir əlavə et</p>
                        </button>
                    </div>
                )}
            </section>
            <div>
                <div className="home-charts">
                    <ApexChart />
                    <CircleChart />
                </div>
                <section className="home-tasks-sec">
                    <div className="home-employee-task">
                        <div>
                            <p>İşçilərin performansı</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Ad</th>
                                    <th>Qrup</th>
                                    <th>Tapşırıqlar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performanceData.length > 0 ? (
                                    performanceData.slice(0, 5).map((item, index) => (
                                        <tr key={index}>
                                            <td>{`${item.first_name} ${item.last_name.charAt(0)}.`}</td>
                                            <td>
                                                {item.group.group ? item.group.group : <span>-</span>}
                                            </td>
                                            <td>{item.task_count.total}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>No performance data available.</tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="home-tasks">
                        <div>
                            <p>Tapşırıqlar</p>
                            <Link to="/tasks/">Hamısına bax</Link>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Ad</th>
                                    <th>Saat</th>
                                    <th>Növ</th>
                                    <th>Ünvan</th>
                                    <th>Nömrə</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length > 0 ? (
                                    tasks.slice(0, 5).map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                {item.first_name && item.last_name
                                                    ? `${item.first_name} ${item.last_name}`
                                                    : "-"}
                                            </td>
                                            <td>
                                                {item.start_time && item.end_time
                                                    ? `${formatTime(item.start_time)} - ${formatTime(
                                                        item.end_time
                                                    )}`
                                                    : !item.start_time && !item.end_time
                                                        ? "-"
                                                        : `${item.start_time ? formatTime(item.start_time) : "-"
                                                        } - ${item.end_time ? formatTime(item.end_time) : "-"
                                                        }`}
                                            </td>
                                            <td>
                                                <div>
                                                    {item.tv && (
                                                        <span>
                                                            <PiTelevisionSimple />
                                                        </span>
                                                    )}
                                                    {item.internet && (
                                                        <span>
                                                            <TfiWorld />
                                                        </span>
                                                    )}
                                                    {item.voice && (
                                                        <span>
                                                            <RiVoiceprintFill />
                                                        </span>
                                                    )}
                                                    {!item.tv && !item.internet && !item.voice && (
                                                        <span>Xidmət daxil edilməyib</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{item.location}</td>
                                            <td>{item.phone ? item.phone : "No Number"}</td>
                                            <td className="task-status">
                                                <button
                                                    className={`status ${item.status
                                                        .toLowerCase()
                                                        .replace(" ", "-")}`}
                                                >
                                                    {item.status === "waiting"
                                                        ? "Gözləyir"
                                                        : item.status === "inprogress"
                                                            ? "Qəbul edilib"
                                                            : item.status === "started"
                                                                ? "Başlanıb"
                                                                : item.status === "completed"
                                                                    ? "Tamamlanıb"
                                                                    : item.status}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <div>No data available.</div>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            <AddEventModal
                isOpen={isModalOpen}
                onClose={closeModal}
                refreshMeetings={handleEventAdded}
            />
            <MeetingDetailModal
                isOpen={isMeetingModalOpen}
                onClose={closeMeetingDetailModal}
                meetingId={selectedMeeting}
            />
        </div>
    );
};

export default Home;
