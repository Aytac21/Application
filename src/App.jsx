import { RouterProvider } from 'react-router-dom';
import { routers } from '../Routers.jsx';
import { UserProvider } from './contexts/UserContext';
import { useState, useEffect, useRef } from 'react';
import "./App.css";
import './responsive.css'

const App = () => {
  const [location, setLocation] = useState(null);

  let ws;


  const connectWebSocket = () => {

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found. Closing WebSocket and retrying connection in 5 seconds...');
      if (ws) {
        ws.close();
      }
      return;
    }
    const email = localStorage.getItem('saved_email')
    ws = new WebSocket(`ws://135.181.42.192/ws/?email=${email}&token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket1 connection established.');

    };

    ws.onmessage = (event) => {
      console.log('Received raw WebSocket1 message:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('Parsed WebSocket message:', data);

      } catch (e) {
        console.error('Error parsing WebSocket1 message:', e);
      }
    };


    ws.onerror = (error) => {
      console.error('WebSocket1 error:', error);
    };

    ws.onclose = (event) => {
      if (event.wasClean) {
        console.log(`WebSocket1 connection closed cleanly, code=${event.code}, reason=${event.reason}`);
        setTimeout(connectWebSocket, 5000);
      } else {
        console.error('WebSocket1 connection died unexpectedly');
        setTimeout(connectWebSocket, 5000);
      }
    };
  };



  const fetchLocation = () => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(
        (position) => {

          if (ws && ws.readyState === WebSocket.OPEN) {
            console.log('-+++=============================', position.coords.latitude)
            let location = {

              latitude: position.coords.latitude,
              longitude: position.coords.longitude,

            }
            console.log('mylocation', location)
            ws.send(JSON.stringify({ location }));
          }


        },
        (error) => {
          console.error("Error getting location: ", error);
        },
        {

          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10000

        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    connectWebSocket();
    fetchLocation();


    return () => {

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);


  useEffect(() => {

    const intervalId = setInterval(() => {
      fetchLocation();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);


  return (
    <UserProvider>
      <RouterProvider router={routers} forceRefresh />
    </UserProvider>
  );
};

export default App;
