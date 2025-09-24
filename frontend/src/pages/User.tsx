import {
  Button,
  Card,
  Col,
  Container,
  Form,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
import DataTable, { type TableColumn } from "react-data-table-component";
import { useEffect, useState } from "react";
import { userService, type User } from "../services/userService";
import { PencilSquare, PersonX } from "react-bootstrap-icons";

export default function UserPage() {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);
  console.log(userObj);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const agencyId = userObj?.agencyId;
      if (!agencyId) throw new Error("No agency info");
      const response = await userService.getUsers(agencyId);
      setUsers(response);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // ✅ only once on mount

  // 🔍 Apply search and role filter
  const filteredUsers = users.filter((u) => {
    const currentUserId = userObj.id;
    const isNotSelf = u.id !== currentUserId;
    const matchesSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter ? u.role === roleFilter : true;

    return isNotSelf && matchesSearch && matchesRole;
  });

  const paginationComponentOptions = {
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

  const columns: TableColumn<User>[] = [
    {
      name: "Name",
      selector: (row) => `${row.firstName} ${row.lastName}`,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.phoneNumber ?? "",
    },
    {
      name: "Email",
      selector: (row) => row.email ?? "",
    },
    {
      name: "Landline",
      selector: (row) => row.landlineNumber ?? "N/A",
    },
    {
      name: "Office Hours",
      selector: (row) => row.officeHours ?? "",
    },
    {
      name: "Role",
      selector: (row) => row.role ?? "",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`tooltip-edit-${row.id}`}>Edit</Tooltip>}
          >
            <span
              role="button"
              // onClick={() => handleEdit(row)}
              style={{
                cursor: "pointer",
                display: "inline-block",
                lineHeight: 0,
              }}
            >
              <PencilSquare size={18} className="text-primary" />
            </span>
          </OverlayTrigger>

          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-deactivate-${row.id}`}>Deactivate</Tooltip>
            }
          >
            <span
              role="button"
              // onClick={() => handleDeactivate(row.id)}
              style={{
                cursor: "pointer",
                display: "inline-block",
                lineHeight: 0,
              }}
            >
              <PersonX size={18} className="text-danger" />
            </span>
          </OverlayTrigger>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <Container fluid className="p-6">
      <PageHeading heading="User Management" />

      <Card>
        <Card.Body>
          {/* 🔎 Search + Filter + Add Button */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {/* <option value="admin">Admin</option> */}
                <option value="agent">Agent</option>
                <option value="collection_supervisor">
                  Collection Supervisor
                </option>
                {/* <option value="super_admin">Super Admin</option> */}
              </Form.Select>
            </Col>
            <Col md={5} className="d-grid d-md-flex justify-content-md-end">
              <Button variant="outline-primary">Add User</Button>
            </Col>
          </Row>

          {/* 📊 DataTable */}
          {loadingUsers ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredUsers}
              pagination
              fixedHeader
              fixedHeaderScrollHeight="500px"
              paginationComponentOptions={paginationComponentOptions}
              customStyles={customStyles}
              highlightOnHover
              pointerOnHover
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
