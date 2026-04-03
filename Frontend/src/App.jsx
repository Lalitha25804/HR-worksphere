import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

// Optional (only if you already created these)
// import Header from "./components/common/Header";
// import Footer from "./components/common/Footer";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Uncomment Header/Footer if you want them globally */}
        {/* <Header /> */}

        <AppRoutes />

        {/* <Footer /> */}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;