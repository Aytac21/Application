import { useState, useEffect, useRef } from 'react';
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineEdit } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import './performance.css';

import axios from 'axios'

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
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("Hamısı");
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);

  const [loggedInUserId, setLoggedInUserId] = useState(null);


  const modalRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [start_date, end_date]);

  useEffect(() => {
    filterData();
  }, [data, selectedGroupFilter, start_date, end_date, selectedYear, selectedMonth, selectedDay]);

  useEffect(() => {
  }, [filteredData, loggedInUserId]);

  const fetchData = async () => {
    try {
      await refreshAccessToken();
      const token = localStorage.getItem('access_token');
      const loggedInUserResponse = await axios.get('http://135.181.42.192/accounts/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setLoggedInUserId(loggedInUserResponse.data.id);

      const loggedInUser = loggedInUserResponse.data;
      console.log('Logged-in user:', loggedInUser);

      const url = new URL('http://135.181.42.192/services/performance/');
      if (start_date) {
        url.searchParams.append('start_date', start_date);
      }
      if (end_date) {
        url.searchParams.append('end_date', end_date);
      }

      console.log('Fetching data from URL:', url.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched data:', data);

      if (Array.isArray(data)) {
        setData(data);
        const uniqueGroups = Array.from(new Set(data.map(item => item.group.group).filter(Boolean)));
        setGroups(uniqueGroups);
      } else {
        console.error('Data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filterData = () => {
    let filtered = [...data];

    filtered = filtered.filter(item =>
      selectedGroupFilter === "Hamısı" || item.group.group === selectedGroupFilter
    );

    console.log('Filtered data:', filtered);
    setFilteredData(filtered);
  };


  const filterByGroup = (group) => {
    setSelectedGroupFilter(group);
    setIsGroupModalOpen(false);
  };

  const handleStartDateClick = (event) => {
    const inputRect = event.target.getBoundingClientRect();
    setIsSelectingStartDate(true);
    setModalPosition({ top: inputRect.bottom + window.scrollY, left: inputRect.left });
    setIsYearModalOpen(true);
  };

  const handleEndDateClick = (event) => {
    const inputRect = event.target.getBoundingClientRect();
    setIsSelectingStartDate(false);
    setModalPosition({ top: inputRect.bottom + window.scrollY, left: inputRect.left });
    setIsYearModalOpen(true);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setIsYearModalOpen(false);
    setIsMonthModalOpen(true);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setIsMonthModalOpen(false);
    setIsDayModalOpen(true);
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    setIsDayModalOpen(false);
    const selectedDate = `${selectedYear}-${(months.indexOf(selectedMonth) + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
    if (isSelectingStartDate) {
      setStartDate(selectedDate);
    } else {
      setEndDate(selectedDate);
    }
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.group-modal') && isGroupModalOpen) {
        setIsGroupModalOpen(false);
      }

    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGroupModalOpen]);

  return (
    <div className='performance-page'>
      <div className='performance-page-title'>
        <p>Performans</p>
      </div>
      <div>
        <div className='performance-filter'>
          <div>
            <button onClick={() => setIsGroupModalOpen(!isGroupModalOpen)}>
              <span>Qrup:</span>
              <span>{selectedGroupFilter}</span>
              <FaChevronDown />
            </button>
            {isGroupModalOpen && (
              <div className="group-modal">
                <div onClick={() => filterByGroup("Hamısı")}>Hamısı</div>
                {groups.map((group, index) => (
                  <div key={index} onClick={() => filterByGroup(group)}>{group}</div>
                ))}
              </div>
            )}
          </div>
          <div className="date-picker-container">
            <input
              type="date"
              className="date-picker"
              value={start_date}
              onClick={handleStartDateClick}
              readOnly
            />
            <input
              type="date"
              className="date-picker"
              value={end_date}
              onClick={handleEndDateClick}
              readOnly
            />
          </div>
        </div>
        <div className="performance-table-container">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Ad</th>
                <th>Qrup</th>
                <th>Vəzifə</th>
                <th>Tapşırıqlar</th>
                <th>Qoşulma</th>
                <th>Problem</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredData) && filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id} className={item.id === loggedInUserId ? 'current-user' : ''}>
                    <td>{`${(index + 1).toString().padStart(2, '0')}`}</td>
                    <td>{item.first_name && item.last_name ? `${item.first_name} ${item.last_name.charAt(0)}.` : '-'}</td>
                    <td>{item.group.group ? item.group.group : '-'}</td>
                    <td>{item.user_type}</td>
                    <td>{item.task_count.total !== undefined ? item.task_count.total : 0}</td>
                    <td>{item.task_count.connection !== undefined ? item.task_count.connection : 0}</td>
                    <td>{item.task_count.problem !== undefined ? item.task_count.problem : 0}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isYearModalOpen && (
        <div className="modal year-modal" style={{ top: modalPosition.top, left: modalPosition.left }}>
          {years.map(year => (
            <div key={year} className="modal-item" onClick={() => handleYearSelect(year)}>{year}</div>
          ))}
        </div>
      )}
      {isMonthModalOpen && (
        <div className="modal month-modal" style={{ top: modalPosition.top, left: modalPosition.left }}>
          {months.map((month, index) => (
            <div key={index} className="modal-item" onClick={() => handleMonthSelect(month)}>{month}</div>
          ))}
        </div>
      )}
      {isDayModalOpen && (
        <div className="modal day-modal" style={{ top: modalPosition.top, left: modalPosition.left }}>
          {days.map((day, index) => (
            <div key={index} className="modal-item" onClick={() => handleDaySelect(day)}>{day}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Index;