
import { useEffect, useState } from 'react'
import './App.css'

type HealthResponse = {
  message: string;
}

function App() {
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://localhost:8080/health');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: HealthResponse = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error('Error fetching health:', error);
        setMessage('Error connecting to backend');
      }
    };

    fetchHealth();
  }, [])

  return (
    <>
      <h1>Frontend Meets Backend</h1>
      <div className="card">
        <p>
          Backend says: <strong>{message}</strong>
        </p>
      </div>
    </>
  )
}

export default App
