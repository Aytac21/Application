import React, { useState, useEffect } from 'react';
import "./history.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { formatDate } from './utils';
import { FaChevronDown } from "react-icons/fa6";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Anbar = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [region, setRegion] = useState('Hamısı');
  const [importSelected, setImportSelected] = useState(false);
  const [exportSelected, setExportSelected] = useState(true);
  const [importData, setImportData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://135.181.42.192/services/history/`,
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [startDate, endDate, region]);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleRegionChange = (event) => {
    setRegion(event.target.value);
  };

  const handleExportClick = () => {
    setExportSelected(true);
    setImportSelected(false);
    setImportData([]); 
  };

  const handleImportClick = async () => {
    setExportSelected(false);
    setImportSelected(true);
    try {
      const response = await fetch(`http://135.181.42.192/services/warehouse_item/`);
      const jsonData = await response.json();
      setImportData(jsonData);
    } catch (error) {
      console.error('Error fetching import data:', error);
    }
  };

  const displayData = importSelected ? importData : data;

  return (
    <div className="history-page">
      <section>
        <div className="button-container">
          <div>
            <button
              className={`exportButton ${exportSelected ? 'selectedButton' : ''}`}
              onClick={handleExportClick}
            >
              İxrac
            </button>
            <button
              className={`importButton ${importSelected ? 'selectedButton' : ''}`}
              onClick={handleImportClick}
            >
              İdxal
            </button>
          </div>
        </div>
        <div className="filter-container">
          <div className="filter-item">
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              id="startDate"
              className="custom-datepicker"
            />
          </div>
          <div className="filter-item">
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              id="endDate"
              className="custom-datepicker"
            />
          </div>
          <div className="filter-item-modal">
            <button>
              <span>Region:</span>
              <span>Hamısı</span>
              <FaChevronDown />
            </button>
          </div>
        </div>
      </section>

      <div className='warehouseTable'>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Vendor</th>
              <th>Marka</th>
              <th>Model</th>
              <th>S/N</th>
              <th>Mac</th>
              <th>Region</th>
              <th>Port sayı</th>
              <th>Sayı</th>
              <th>Tarix</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((data, index) => (
              <tr key={index}>
                <td>{data.id ? `#${data.id.toString().padStart(4, '0')}` : 'N/A'}</td>
                <td>{data.vendor || data.equipment_name}</td>
                <td>{data.brand}</td>
                <td>{data.model}</td>
                <td>{data.serial_number}</td>
                <td>{data.mac}</td>
                <td>{data.region || (data.warehouse && data.warehouse.region)}</td>
                <td>{data.port_number}</td>
                <td>{data.number}</td>
                <td>{data.timestamp ? formatDate(data.timestamp) : 'N/A'}</td>
                <td><BsThreeDotsVertical /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Anbar;
