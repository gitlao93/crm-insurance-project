import { ListGroup, Dropdown, Image, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { NotificationList } from "./NotificationList";
import {
  notificationService,
  type Notification,
} from "../../../services/notificationService";
import { connectSocket } from "../../../services/socketService";
import { useAppActivity } from "../../../context/useAppActivity";
import ChangePasswordModal from "../../../pages/user-modal/ChangePasswordModal";

export const DesktopNotifications: React.FC = () => {
  const { inSlackPage } = useAppActivity();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);

  /** 🧩 Load user info from localStorage */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUserId(userObj.id);
        setName(`${userObj.firstName} ${userObj.lastName}`);
        setEmail(userObj.email);
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
      }
    }
  }, []);

  /** 🔔 Fetch notifications when userId changes */
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const data = await notificationService.getNotifications(userId);
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    })();
  }, [userId]);

  /** 🔗 Connect to WebSocket and listen for real-time notifications */
  useEffect(() => {
    if (!userId) return;
    const socket = connectSocket();

    socket.emit("joinUser", { userId });

    socket.on("newNotification", (notif: Notification) => {
      console.log("🆕 New notification:", notif);

      if (inSlackPage) {
        // Don't show desktop bell updates; let SlackMessaging handle badge
        return;
      }

      // Otherwise update notification list and badge
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newNotification");
    };
  }, [userId, inSlackPage]);

  /** 🧹 Mark notification as read (on click) */
  const handleNotificationClick = async (id: number, link?: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      if (link) navigate(link);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  /** 🚪 Logout */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (

    <>

    <ListGroup
      as="ul"
      bsPrefix="navbar-nav"
      className="navbar-right-wrap ms-auto d-flex nav-top-wrap"
    >
      {/* 🔔 Notification dropdown */}
      <Dropdown
        as="li"
        className="stopevent"
        show={showDropdown}
        onToggle={(isOpen) => setShowDropdown(isOpen)}
      >
        <Dropdown.Toggle
          as="a"
          bsPrefix=" "
          id="dropdownNotification"
          className="btn btn-light btn-icon rounded-circle indicator text-muted position-relative"
        >
          <i className="fe fe-bell"></i>
          {unreadCount > 0 && (
            <Badge
              bg="danger"
              pill
              className="position-absolute top-0 start-100 translate-middle"
            >
              {unreadCount}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-end py-0"
          aria-labelledby="dropdownNotification"
          align="end"
        >
          <Dropdown.Item className="mt-3" bsPrefix=" " as="div">
            <div className="border-bottom px-3 pt-0 pb-3 d-flex justify-content-between align-items-end">
              <span className="h4 mb-0">Notifications</span>
            </div>

            <NotificationList
              notificationItems={notifications}
              onNotificationClick={handleNotificationClick}
            />

            <div className="border-top px-3 pt-3 pb-3">
              <Link
                to="/notification-history"
                className="text-link fw-semi-bold"
              >
                See all Notifications
              </Link>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* 👤 User menu */}
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
              src="/images/brand/goodlife-logo.png"
              className="rounded-circle"
            />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu
          className="dropdown-menu dropdown-menu-end"
          align="end"
          aria-labelledby="dropdownUser"
        >
          <Dropdown.Item as="div" className="px-5 pb-0 pt-2" bsPrefix=" ">
            <div className="lh-1">
              <h6 className="mb-1">{name}</h6>
              <h6>{email}</h6>
              <div className="dropdown-divider mt-3 mb-2"></div>
            </div>
          </Dropdown.Item>
                      <Dropdown.Item onClick={() => setShowPasswordModal(true)}>
              <i className="fe fe-settings me-2"></i>Change password
            </Dropdown.Item>
          <Dropdown.Item onClick={handleLogout}>
            <i className="fe fe-power me-2"></i>Sign Out
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </ListGroup> 

     <ChangePasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => alert("Password changed successfully!")}
        userId={userId!}
      />

    </>
  );
};
