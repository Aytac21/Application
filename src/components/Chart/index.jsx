import React from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import "./chart.css";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";

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


class ApexChart extends React.Component {
    constructor(props) {
        super(props);

        const currentYear = new Date().getFullYear();

        this.state = {
            year: currentYear,
            series: [{
                name: 'Qoşulmalar',
                data: Array(12).fill(0)
            }, {
                name: 'Problemlər',
                data: Array(12).fill(0)
            }, {
                name: 'Boş',
                data: Array(12).fill(0)
            }],
            options: {
                chart: {
                    type: 'bar',
                    height: 350,
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '50%',
                        endingShape: 'rounded',
                        dataLabels: {
                            position: 'top'
                        },
                    },
                },
                dataLabels: {
                    enabled: false,
                    offsetY: -10,
                    style: {
                        fontSize: '12px',
                        colors: ["#304758"]
                    }
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent']
                },
                xaxis: {
                    categories: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyun', 'İyul', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'],
                },

                fill: {
                    colors: ["#FF5449", "#36C43D", "transparent"],
                },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val + " ədəd"
                        }
                    }
                },
                grid: {
                    row: {
                        colors: ['#ffffff', '#f3f3f3'],
                        opacity: 1
                    },
                },
                legend: {
                    show: false
                }
            },
            legendLabels: ['Qoşulmalar', 'Problemlər'],
        };
    }

    componentDidMount() {
        this.fetchData(this.state.year);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.year !== this.state.year) {
            this.fetchData(this.state.year);
        }
    }

    fetchData = async (year, isRetry = false) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://135.181.42.192/services/mainpage/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const { completed_tasks } = response.data;

            const connectionCounts = Array(12).fill(0);
            const problemCounts = Array(12).fill(0);

            completed_tasks.forEach(task => {
                const taskDate = new Date(task.date);
                const taskYear = taskDate.getFullYear();
                const taskMonth = taskDate.getMonth();

                if (taskYear === year) {
                    if (task.task_type === 'connection') {
                        connectionCounts[taskMonth]++;
                    } else if (task.task_type === 'problem') {
                        problemCounts[taskMonth]++;
                    }
                }
            });

            const filteredConnectionCounts = connectionCounts.map(count => count > 0 ? count : null);
            const filteredProblemCounts = problemCounts.map(count => count > 0 ? count : null);

            this.setState({
                series: [{
                    name: 'Qoşulmalar',
                    data: filteredConnectionCounts
                }, {
                    name: 'Problemlər',
                    data: filteredProblemCounts
                }, {
                    name: 'Boş',
                    data: Array(12).fill(0)
                }]
            });

        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403) && !isRetry) {
                try {
                    await refreshAccessToken();
                    await this.fetchData(year, true);
                } catch (refreshError) {
                    console.error('Error: Token refresh failed:', refreshError);
                }
            } else {
                console.error('Error: Unable to fetch data:', error);
            }
        }
    }

    handleIncrementYear = () => {
        const { year } = this.state;
        const currentYear = new Date().getFullYear();
        if (year < currentYear) {
            this.setState({ year: year + 1 });
        }
    }

    handleDecrementYear = () => {
        const { year } = this.state;
        if (year > 1970) {
            this.setState({ year: year - 1 });
        }
    }

    render() {
        const { year, options, legendLabels } = this.state;
        return (
            <div id="chart">
                <div className="year-filter">
                    <FaAngleLeft onClick={this.handleDecrementYear} />
                    <span>{year}</span>
                    <FaAngleRight onClick={this.handleIncrementYear} />
                </div>
                <ReactApexChart options={this.state.options} series={this.state.series} type="bar" height={250} />
                <div className='home-chart-services-chart'>
                    {legendLabels.map((label, index) => (
                        <div key={index}>
                            <FaCircle style={{ color: options.fill.colors[index] }} />
                            <p>{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default ApexChart;
