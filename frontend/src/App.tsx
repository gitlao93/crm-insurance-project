import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RootLayout from "./layouts/RootLayout";
import Message from "./pages/Message";
import PrivateRoute from "./components/PrivateRoute";
import User from "./pages/User";
import Lead from "./pages/Lead";
import PolicyCategory from "./pages/PolicyCategory";
import PolicyPlan from "./pages/PolicyPlan";
import PolicyHolder from "./pages/PolicyHolder";
import AgencySetting from "./pages/AgencySetting";
import PolicyHolderSoa from "./pages/PolicyHolderSoa";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootLayout />}>
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="user"
            element={
              <PrivateRoute>
                <User />
              </PrivateRoute>
            }
          />
          <Route
            path="policy-category"
            element={
              <PrivateRoute>
                <PolicyCategory />
              </PrivateRoute>
            }
          />
          <Route
            path="policy-catalog"
            element={
              <PrivateRoute>
                <PolicyPlan />
              </PrivateRoute>
            }
          />
          <Route
            path="policy-holder"
            element={
              <PrivateRoute>
                <PolicyHolder />
              </PrivateRoute>
            }
          />

          <Route
            path="policy-holder-soa"
            element={
              <PrivateRoute>
                <PolicyHolderSoa />
              </PrivateRoute>
            }
          />
          <Route
            path="message"
            element={
              <PrivateRoute>
                <Message />
              </PrivateRoute>
            }
          />
          <Route
            path="lead"
            element={
              <PrivateRoute>
                <Lead />
              </PrivateRoute>
            }
          />
          <Route
            path="setting"
            element={
              <PrivateRoute>
                <AgencySetting />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
