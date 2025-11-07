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
import Commission from "./pages/Commission";
import Home from "./pages/Home";
import ClaimRequest from "./pages/ClaimRequest";
// import MessagesPage from "./pages/Messages";
import SlackMessagingPage from "./pages/SlackMessagingPage";
import { AppActivityProvider } from "./context/AppActivityProvider";
import ForbiddenPage from "./pages/ForbiddenPage";

function App() {
  return (
    <AppActivityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/Home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootLayout />}>
            <Route
              path="dashboard"
              element={
                <PrivateRoute
                  allowedRoles={["admin", "collection_supervisor", "agent"]}
                >
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="user"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <User />
                </PrivateRoute>
              }
            />
            <Route
              path="claim-request"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <ClaimRequest />
                </PrivateRoute>
              }
            />
            <Route
              path="policy-category"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <PolicyCategory />
                </PrivateRoute>
              }
            />
            <Route
              path="policy-catalog"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <PolicyPlan />
                </PrivateRoute>
              }
            />
            <Route
              path="policy-holder"
              element={
                <PrivateRoute
                  allowedRoles={["admin", "collection_supervisor", "agent"]}
                >
                  <PolicyHolder />
                </PrivateRoute>
              }
            />

            <Route
              path="policy-holder-soa"
              element={
                <PrivateRoute
                  allowedRoles={["admin", "collection_supervisor", "agent"]}
                >
                  <PolicyHolderSoa />
                </PrivateRoute>
              }
            />

            <Route
              path="commission"
              element={
                <PrivateRoute allowedRoles={["agent"]}>
                  <Commission />
                </PrivateRoute>
              }
            />
            <Route
              path="message"
              element={
                <PrivateRoute
                  allowedRoles={["admin", "collection_supervisor", "agent"]}
                >
                  <Message />
                </PrivateRoute>
              }
            />

            {/* <Route
            path="messages"
            element={
              <PrivateRoute
                  allowedRoles={["admin", "collection_supervisor", "agent"]}>
                <MessagesPage />
              </PrivateRoute>
            }
          /> */}

            <Route
              path="slack-messaging"
              element={
                <PrivateRoute
                  allowedRoles={["admin", "collection_supervisor", "agent"]}
                >
                  <SlackMessagingPage />
                </PrivateRoute>
              }
            />
            <Route
              path="lead"
              element={
                <PrivateRoute allowedRoles={["admin", "agent"]}>
                  <Lead />
                </PrivateRoute>
              }
            />
            <Route
              path="setting"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AgencySetting />
                </PrivateRoute>
              }
            />
          </Route>
          <Route path="/403" element={<ForbiddenPage />} />
        </Routes>
      </BrowserRouter>
    </AppActivityProvider>
  );
}

export default App;
