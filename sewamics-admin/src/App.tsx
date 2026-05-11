import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SplashScreen from './screens/SplashScreen';
import PlaceholderScreen from './screens/PlaceholderScreen';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Splash/Login Route */}
        <Route 
          path="/" 
          element={currentUser ? <Navigate to="/placeholder" /> : <SplashScreen />} 
        />

        {/* Static Placeholder Route (Accessible for testing) */}
        <Route 
          path="/placeholder" 
          element={<PlaceholderScreen />} 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
