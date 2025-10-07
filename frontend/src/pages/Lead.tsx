import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Offcanvas,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  InteractionType,
  leadService,
  LeadStatus,
  type Lead,
} from "../services/leadServices";
import { BoxArrowDownRight, PencilSquare } from "react-bootstrap-icons";
import LeadInteraction from "./lead-offcanvas/LeadInteraction";
import LeadCreateModal from "./lead-modal/LeadCreateModal";
import LeadInteractionCreateModal from "./lead-modal/LeadInteractionCreateModal";

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
  const [selectedLeadId, setSelectedLeadId] = useState<number>(0);
  const [showCreateInteraction, setShowCreateInteraction] = useState(false);
  const [interActionType, setInteractionType] =
    useState<InteractionType | null>();
  const [refreshInteractionsFlag, setRefreshInteractionsFlag] = useState(0);

  // --- Lead status modal ---
  const [leadId, setLeadId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newStatus, setNewStatus] = useState<LeadStatus>(LeadStatus.NEW);

  const handleInteractionCreated = () => {
    setRefreshInteractionsFlag((prev) => prev + 1);
  };

  const fetchLeads = useCallback(async () => {
    try {
      setLoadingLeads(true);
      const userId = userObj?.id;
      if (!userId) throw new Error("No agency info");
      const response = await leadService.getLeads(userId);
      setLeads(response);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  }, [userObj?.id]);

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
      selector: (row) => row.policyPlan.policyName ?? "",
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
        </div>
      ),
    },
  ];

  const handleShowInteraction = (lead: Lead) => {
    setSelectedLead(lead);
    setShowOffcanvas(true);
    setSelectedLeadId(lead?.id ?? 0);
  };

  const handleShowCreateInteraction = (type: InteractionType) => {
    setInteractionType(type);
    setShowCreateInteraction(true);
  };

  const handleCloseOffcanvas = () => {
    setSelectedLead(null);
    setShowOffcanvas(false);
  };

  // --- Change Lead Status ---
  const handleChangeLeadStatus = (leadId: number | undefined) => {
    if (!leadId) return;

    setLeadId(leadId);

    const currentLead = leads.find((l) => l.id === leadId);
    if (currentLead) {
      setNewStatus(currentLead.status as LeadStatus);
    }

    setShowEditModal(true);
  };

  const handleSubmitStatus = async () => {
    if (!leadId || !newStatus) return;

    try {
      console.log("handleSubmitStatus", newStatus);
      await leadService.updateLead(leadId, { status: newStatus });

      // ✅ Update leads state directly
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );

      // ✅ Update selectedLead if it's the one being edited
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }

      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update lead status", err);
    }
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
              {userObj.role === "agent" ? (
                <Button
                  onClick={() => setShowCreate(true)}
                  variant="outline-primary"
                >
                  Add Lead
                </Button>
              ) : null}
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

      <LeadCreateModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={fetchLeads}
      />

      <LeadInteractionCreateModal
        show={showCreateInteraction}
        onClose={() => setShowCreateInteraction(false)}
        onSuccess={handleInteractionCreated}
        leadId={selectedLeadId}
        type={interActionType ?? InteractionType.CALL}
      />

      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="end"
      >
        <Offcanvas.Header closeButton className="align-items-start">
          <Offcanvas.Title>
            <h3>
              {selectedLead?.firstName} {selectedLead?.lastName}
            </h3>
            <h6>{selectedLead?.email}</h6>
            <h6>{selectedLead?.phoneNumber}</h6>
            <p className="d-flex align-items-center gap-2">
              <Badge>{selectedLead?.status}</Badge>
              <PencilSquare
                onClick={() => handleChangeLeadStatus(selectedLead?.id)}
                size={18}
                className="text-success"
                role="button"
                style={{ cursor: "pointer" }}
              />
            </p>

            <ButtonGroup size="sm">
              <Button
                onClick={() => {
                  handleShowCreateInteraction(InteractionType.MEETING);
                }}
              >
                Meeting
              </Button>
              <Button
                onClick={() => {
                  handleShowCreateInteraction(InteractionType.CALL);
                }}
              >
                Call
              </Button>
              <Button
                onClick={() => {
                  handleShowCreateInteraction(InteractionType.FOLLOW_UP);
                }}
              >
                Follow up
              </Button>
              <Button
                onClick={() => {
                  handleShowCreateInteraction(InteractionType.EMAIL);
                }}
              >
                Email
              </Button>
            </ButtonGroup>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedLead && (
            <LeadInteraction
              lead={selectedLead}
              refreshKey={refreshInteractionsFlag}
            />
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* --- Status Modal --- */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
          >
            <option value={LeadStatus.INPROGRESS}>
              {LeadStatus.INPROGRESS}
            </option>
            <option value={LeadStatus.CONVERTED}>{LeadStatus.CONVERTED}</option>
            <option value={LeadStatus.DROPPED}>{LeadStatus.DROPPED}</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitStatus}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
