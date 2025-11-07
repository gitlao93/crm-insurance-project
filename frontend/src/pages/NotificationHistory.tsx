import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useEffect, useState, useCallback } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import PageHeading from "../widgets/PageHeading";
import {
  notificationService,
  type Notification,
} from "../services/notificationService";
import { useNavigate } from "react-router-dom";

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  /** 👤 Load user */
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);

  /** 🔍 Fetch notifications */
  const fetchNotifications = useCallback(async () => {
    if (!userObj?.id) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(userObj.id);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userObj?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /** 🔎 Filter notifications */
  const filteredNotifications = notifications.filter((notif) => {
    const msg = (notif.message ?? "").toLowerCase();
    return msg.includes(search.toLowerCase());
  });

  /** 📋 DataTable columns */
  const columns: TableColumn<Notification>[] = [
    {
      name: "Message",
      selector: (row) => row.message ?? "",
      wrap: true,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) =>
        new Date(row.createdAt).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (row.isRead ? "Read" : "Unread"),
      sortable: true,
    },
  ];

  /** 🧭 Row click → navigate */
  const handleRowClick = (row: Notification) => {
    if (row.link) navigate(row.link);
  };

  /** 🧭 Back to Dashboard */
  const handleBack = () => navigate("/dashboard");

  const paginationOptions = {
    rowsPerPageText: "Rows per page",
    rangeSeparatorText: "of",
  };

  const customStyles = {
    table: {
      style: {
        minHeight: "500px",
        padding: "10px",
      },
    },
  };

  return (
    <Container fluid className="p-6">
      <PageHeading heading="Notification History" />
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-4">
            <Col md={7}>
              <Form.Control
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md={5} className="d-grid d-md-flex justify-content-md-end">
              <Button variant="outline-secondary" onClick={handleBack}>
                Back
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredNotifications}
              pagination
              fixedHeader
              fixedHeaderScrollHeight="500px"
              paginationComponentOptions={paginationOptions}
              customStyles={customStyles}
              highlightOnHover
              pointerOnHover
              onRowClicked={handleRowClick}
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
