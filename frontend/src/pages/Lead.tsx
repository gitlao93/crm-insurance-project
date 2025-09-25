import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Offcanvas,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { leadService, type Lead } from "../services/leadServices";
import { BoxArrowDownRight } from "react-bootstrap-icons";
import LeadInteraction from "./lead-offcanvas/LeadInteraction";

export default function UserPage() {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoadingLeads(true);
      const agencyId = userObj?.agencyId;
      if (!agencyId) throw new Error("No agency info");
      const response = await leadService.getLeads(agencyId);
      setLeads(response);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  }, [userObj?.agencyId]);

  const filteredLeads = leads.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter ? u.status === statusFilter : true;

    const matchesAgent =
      userObj?.role === "agent" ? u.agentId === userObj.id : true;

    return matchesSearch && matchesStatus && matchesAgent;
  });

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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

  const columns: TableColumn<Lead>[] = [
    ...(userObj?.role === "admin"
      ? [
          {
            name: "Agent",
            selector: (row: Lead) =>
              `${row.agent.firstName} ${row.agent.lastName}`,
            sortable: true,
          } as TableColumn<Lead>,
        ]
      : []),
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
      name: "Policy Plan",
      selector: (row) => row.policyPlan.planName ?? "",
    },
    {
      name: "Status",
      selector: (row) => row.status ?? "",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-edit-${row.id}`}>Lead History</Tooltip>
            }
          >
            <span
              role="button"
              onClick={() => handleShowInteraction(row)}
              style={{
                cursor: "pointer",
                display: "inline-block",
                lineHeight: 0,
              }}
            >
              <BoxArrowDownRight size={18} className="text-primary" />
            </span>
          </OverlayTrigger>

          {/* <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-deactivate-${row.id}`}>Deactivate</Tooltip>
            }
          >
            <span
              role="button"
              onClick={() => handleDeactivate(row.id)}
              style={{
                cursor: "pointer",
                display: "inline-block",
                lineHeight: 0,
              }}
            >
              <PersonX size={18} className="text-danger" />
            </span>
          </OverlayTrigger> */}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const handleShowInteraction = (lead: Lead) => {
    setSelectedLead(lead);
    setShowOffcanvas(true);
  };

  const handleCloseOffcanvas = () => {
    setSelectedLead(null);
    setShowOffcanvas(false);
  };
  return (
    <Container fluid className="p-6">
      <PageHeading heading="Lead Management" />

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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="New">New</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Converted">Converted</option>
                <option value="Dropped">Dropped</option>
              </Form.Select>
            </Col>
            <Col md={5} className="d-grid d-md-flex justify-content-md-end">
              <Button
                onClick={() => setShowCreate(true)}
                variant="outline-primary"
              >
                Add Lead
              </Button>
            </Col>
          </Row>
          {loadingLeads ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredLeads}
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
      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <h3>
              {selectedLead?.firstName} {selectedLead?.lastName}
            </h3>
            <h6>{selectedLead?.email}</h6>
            <h6>{selectedLead?.phoneNumber}</h6>
            <p>
              <Badge>{selectedLead?.status}</Badge>
            </p>

            <ButtonGroup size="sm">
              <Button>Meeting</Button>
              <Button>Call</Button>
              <Button>Follow up</Button>
              <Button>Email</Button>
            </ButtonGroup>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedLead && <LeadInteraction lead={selectedLead} />}
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
}
