import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineEdit } from "react-icons/md";
import { IoFilterOutline } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FaChevronDown, FaArrowLeft, FaArrowRight, FaCircle } from "react-icons/fa";
import "./employees.css";
import { PiMapPinAreaFill } from "react-icons/pi";


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

const translateUserType = (userType) => {
  switch (userType) {
    case 'technician':
      return 'Texnik';
    case 'plumber':
      return 'Plumber';
    case 'office_manager':
      return 'Ofis meneceri';
    case 'tech_manager':
      return 'Texnik menecer';
    default:
      return userType;
  }
};

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState(null);
  const [groupFilter, setGroupFilter] = useState(null);
  const [showUserTypeOptions, setShowUserTypeOptions] = useState(false);
  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [employeeModals, setEmployeeModals] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        await refreshAccessToken();
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://135.181.42.192/accounts/users/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setEmployees(response.data);
        initializeEmployeeModals(response.data);
      } catch (error) {
        console.error('Error fetching the employees data:', error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response && error.response.status === 401) {
          try {
            await refreshAccessToken();
            return axios(error.config);
          } catch (refreshError) {
            console.error('Error: Token refresh failed:', refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const initializeEmployeeModals = (employeesData) => {
    const initialModals = {};
    employeesData.forEach(employee => {
      initialModals[employee.id] = false;
    });
    setEmployeeModals(initialModals);
  };

  const openSmallModal = (employeeId) => {
    setEmployeeModals(prevModals => ({
      ...prevModals,
      [employeeId]: true
    }));
  };

  const closeSmallModal = (employeeId) => {
    setEmployeeModals(prevModals => ({
      ...prevModals,
      [employeeId]: false
    }));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleUserTypeFilter = (type) => {
    setUserTypeFilter(type);
    setShowUserTypeOptions(false);
    setCurrentPage(1);
  };

  const handleGroupFilter = (group) => {
    setGroupFilter(group);
    setShowGroupOptions(false);
    setCurrentPage(1);
  };

  const getFilteredEmployees = () => {
    let filteredEmployees = employees;

    if (searchTerm) {
      filteredEmployees = filteredEmployees.filter(employee => (
        employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }

    if (userTypeFilter) {
      filteredEmployees = filteredEmployees.filter(employee => (
        employee.user_type === userTypeFilter
      ));
    }

    if (groupFilter) {
      filteredEmployees = filteredEmployees.filter(employee => (
        employee.group && employee.group.group === groupFilter
      ));
    }

    return filteredEmployees;
  };

  const currentItems = getFilteredEmployees().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(getFilteredEmployees().length / itemsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className='employee-page'>
      <h1>İşçilər</h1>
      <div className='employee-search-filter'>
        <div>
          <CiSearch />
          <input
            type="search"
            placeholder='İşçiləri axtar'
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <IoFilterOutline />
        </div>
        <div>
          <div>
            <button onClick={() => setShowUserTypeOptions(!showUserTypeOptions)}>
              <span>Vəzifə:</span>
              <span>{userTypeFilter ? translateUserType(userTypeFilter) : 'Hamısı'}</span>
              <FaChevronDown />
            </button>
            {showUserTypeOptions && (
              <div className="group-modal">
                <div onClick={() => handleUserTypeFilter(null)}>Hamısı</div>
                <div onClick={() => handleUserTypeFilter('technician')}>Texniklər</div>
                <div onClick={() => handleUserTypeFilter('plumber')}>Plumber</div>
                <div onClick={() => handleUserTypeFilter('office_manager')}>Ofis meneceri</div>
                <div onClick={() => handleUserTypeFilter('tech_manager')}>Texnik menecer</div>
              </div>
            )}
          </div>
          <div>
            <button onClick={() => setShowGroupOptions(!showGroupOptions)}>
              <span>Qrup:</span>
              <span>{groupFilter ? groupFilter : 'Hamısı'}</span>
              <FaChevronDown />
            </button>
            {showGroupOptions && (
              <div className="group-modal employee-modal-group">
                <div onClick={() => handleGroupFilter(null)}>Hamısı</div>
                {[...new Set(employees.map(employee => employee.group && employee.group.group))]
                  .filter(group => group)
                  .map((group, index) => (
                    <div key={index} onClick={() => handleGroupFilter(group)}>
                      {group}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="employee-table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ad</th>
              <th>Qrup</th>
              <th>Adres</th>
              <th>Nōmrǝ</th>
              <th>Vəzifə</th>
              <th>Status</th>
              <th>Məkan</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((employee, index) => (
              <tr key={employee.id}>
                <td>{`#${(index + 1).toString().padStart(4, '0')}`}</td>
                <td>{employee.first_name} {employee.last_name}</td>
                <td>{employee.group ? employee.group.group : 'Yoxdur'}</td>
                <td>{employee.group ? employee.group.region : 'Yoxdur'}</td>
                <td>{employee.phone}  {!employee.phone && <span>-</span>}</td>
                <td>{translateUserType(employee.user_type)}</td>
                <td className='status'><p><FaCircle /> Aktiv</p></td>
                <td><a href=""><PiMapPinAreaFill /></a></td>
                <td>
                  <button onClick={() => openSmallModal(employee.id)}><BsThreeDotsVertical /></button>
                  {employeeModals[employee.id] && (
                    <div
                      ref={modalRef}
                      className={`small-modal-employee active`}
                    >
                      <div className="small-modal-employee-content">
                        <button>
                          <RiDeleteBin6Line />
                        </button>
                        <button>
                          <MdOutlineEdit />
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          <FaArrowLeft />
        </button>
        {Array(Math.ceil(getFilteredEmployees().length / itemsPerPage))
          .fill(0)
          .map((_, i) => (
            <button key={i + 1} onClick={() => paginate(i + 1)} disabled={i + 1 === currentPage}>
              {i + 1}
            </button>
          ))}
        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(employees.length / itemsPerPage)}>
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default EmployeeList;
