import { ListGroup, Dropdown, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { NotificationList } from "./NotificationList";
import type { NotificationProps } from "../../../types";
import { useEffect, useState } from "react";

interface DesktopNotificationProps {
  data: NotificationProps[];
}

export const DesktopNotifications: React.FC<DesktopNotificationProps> = ({
  data,
}) => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setName(`${userObj.firstName} ${userObj.lastName}`);
        setEmail(`${userObj.email}`);
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // redirect to login page
  };

  return (
    <ListGroup
      as="ul"
      bsPrefix="navbar-nav"
      className="navbar-right-wrap ms-auto d-flex nav-top-wrap"
    >
      <Dropdown as="li" className="stopevent">
        <Dropdown.Toggle
          as="a"
          bsPrefix=" "
          id="dropdownNotification"
          className="btn btn-light btn-icon rounded-circle indicator indicator-primary text-muted"
        >
          <i className="fe fe-bell"></i>
        </Dropdown.Toggle>
        <Dropdown.Menu
          className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-end py-0"
          aria-labelledby="dropdownNotification"
          align="end"
          show
        >
          <Dropdown.Item className="mt-3" bsPrefix=" " as="div">
            <div className="border-bottom px-3 pt-0 pb-3 d-flex justify-content-between align-items-end">
              <span className="h4 mb-0">Notifications</span>
              <Link to="/" className="text-muted">
                <span className="align-middle">
                  <i className="fe fe-settings me-1"></i>
                </span>
              </Link>
            </div>

            <NotificationList notificationItems={data} />
            <div className="border-top px-3 pt-3 pb-3">
              <Link
                to="/dashboard/notification-history"
                className="text-link fw-semi-bold"
              >
                See all Notifications
              </Link>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown as="li" className="ms-2">
        <Dropdown.Toggle
          as="a"
          bsPrefix=" "
          className="rounded-circle"
          id="dropdownUser"
        >
          <div className="avatar avatar-md avatar-indicators avatar-online">
            <Image
              alt="avatar"
              src="/images/avatar/avatar-1.jpg"
              className="rounded-circle"
            />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu
          className="dropdown-menu dropdown-menu-end "
          align="end"
          aria-labelledby="dropdownUser"
          show
        >
          <Dropdown.Item as="div" className="px-5 pb-0 pt-2" bsPrefix=" ">
            <div className="lh-1 ">
              <h6 className="mb-1">{name}</h6>
              <h6>{email}</h6>
              {/* <Link to="#" className="text-inherit fs-6">
                View my profile
              </Link> */}
            </div>
            <div className=" dropdown-divider mt-3 mb-2"></div>
          </Dropdown.Item>
          {/* <Dropdown.Item eventKey="2">
            <i className="fe fe-user me-2"></i> Edit Profile
          </Dropdown.Item>
          <Dropdown.Item eventKey="3">
            <i className="fe fe-activity me-2"></i> Activity Log
          </Dropdown.Item>
          <Dropdown.Item className="text-primary">
            <i className="fe fe-star me-2"></i> Go Pro
          </Dropdown.Item>
          <Dropdown.Item>
            <i className="fe fe-settings me-2"></i> Account Settings
          </Dropdown.Item> */}
          <Dropdown.Item onClick={handleLogout}>
            <i className="fe fe-power me-2"></i>Sign Out
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </ListGroup>
  );
};
