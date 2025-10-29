import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";
import { useCallback, useEffect, useState } from "react";
import {
  policyHolderService,
  type Billing,
  type PolicyHolder,
} from "../services/policyHolderService";
import type { TableColumn } from "react-data-table-component";
import DataTable from "react-data-table-component";
import { BoxArrowRight, PencilSquare, Wallet } from "react-bootstrap-icons";
import PolicyHolderCreateModal from "./policy-modal/PolicyHolderCreateModal";
import { leadService, type Lead } from "../services/leadServices";
import UpdatePolicyHolderModal from "./policy-modal/UpdatePolicyHolderModal";
import { useNavigate } from "react-router-dom";
import BillingPaymentModal from "./billing-modal/BillingPaymentModal";

export default function PolicyHolder() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);

  // 🔹 States
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [policyHolder, setPolicyHolder] = useState<PolicyHolder[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [showLeadPicker, setShowLeadPicker] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  // 🔹 Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPolicyHolder, setSelectedPolicyHolder] =
    useState<PolicyHolder | null>(null);

  const [billings, setBillings] = useState<Billing[]>([]);
  const [showPayment, setShowPayment] = useState(false);

  // 🔹 Fetch Leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoadingLeads(true);
      const userId = userObj?.id;
      if (!userId) throw new Error("No agency info");
      const response = await leadService.getLeads(userId);
      setLeads(response);
    } catch (err) {
      console.error("Failed to fetch leads", err);
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  }, [userObj?.id]);

  // 🔹 Fetch Policy Holders
  const fetchPolicyHolder = useCallback(async () => {
    try {
      setLoading(true);
      const userId = userObj?.id;
      if (!userId) throw new Error("No agency info");
      const response = await policyHolderService.getAll(userId);
      console.log("response", response);
      setPolicyHolder(response);
    } catch (err) {
      console.error("Failed to fetch Policy Holders", err);
      setPolicyHolder([]);
    } finally {
      setLoading(false);
    }
  }, [userObj?.id]);

  useEffect(() => {
    fetchPolicyHolder();
    fetchLeads();
  }, [fetchPolicyHolder, fetchLeads]);

  // 🔍 Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    if (!leadSearch.trim()) return false;
    const name = `${lead.firstName} ${lead.lastName}`.toLowerCase();
    return name.includes(leadSearch.toLowerCase());
  });

  // 🔹 Lead selection
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadPicker(false);
    setShowCreate(true);
  };

  const handleSkipLead = () => {
    setSelectedLead(null);
    setShowLeadPicker(false);
    setShowCreate(true);
  };

  const handleShowCreatePolicyHolder = () => {
    setLeadSearch("");
    setShowLeadPicker(true);
  };

  // 🔹 Edit
  const handleEdit = (holder: PolicyHolder) => {
    setSelectedPolicyHolder(holder);
    setShowEditModal(true);
  };
  const handleViewSoa = (holder: PolicyHolder) => {
    // setSelectedPolicyHolder(holder);
    sessionStorage.setItem("selectedPolicyHolder", JSON.stringify(holder));
    navigate("/policy-holder-soa");
  };

  const handleOpenPayment = (holder: PolicyHolder) => {
    setBillings(holder.soa.billings);
    setShowPayment(true);
  };

  // 🔹 Filter Policy Holders
  const filteredPolicyHolder = policyHolder.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
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

  // 🔹 Columns
  const columns: TableColumn<PolicyHolder>[] = [
    {
      name: "Name",
      selector: (row) => `${row.firstName} ${row.lastName}`,
      sortable: true,
    },
    {
      name: "Policy Name",
      selector: (row) => `${row.policyPlan?.policyName ?? "N/A"}`,
      sortable: true,
    },
    {
      name: "Policy Number",
      selector: (row) => `${row.policyNumber ?? "N/A"}`,
      sortable: true,
    },
    {
      name: "Start Date",
      selector: (row) => `${row.StartDate?.split("T")[0] ?? ""}`,
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row) => `${row.EndDate?.split("T")[0] ?? ""}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => `${row.status}`,
      sortable: true,
    },
    ...(userObj?.role === "admin"
      ? [
          {
            name: "Agent",
            selector: (row: PolicyHolder) =>
              `${row.agent.firstName} ${row.agent.lastName}`,
            sortable: true,
          } as TableColumn<PolicyHolder>,
        ]
      : []),
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
              onClick={() => handleEdit(row)}
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
            overlay={<Tooltip id={`tooltip-edit-${row.id}`}>View SOA</Tooltip>}
          >
            <span
              role="button"
              onClick={() => handleViewSoa(row)}
              style={{
                cursor: "pointer",
                display: "inline-block",
                lineHeight: 0,
              }}
            >
              <BoxArrowRight size={18} className="text-secondary" />
            </span>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-edit-${row.id}`}>Policy Payment</Tooltip>
            }
          >
            <span
              role="button"
              onClick={() => handleOpenPayment(row)}
              style={{
                cursor: "pointer",
                display: "inline-block",
                lineHeight: 0,
              }}
            >
              <Wallet size={18} className="text-secondary" />
            </span>
          </OverlayTrigger>
        </div>
      ),
    },
  ];

  return (
    <Container fluid className="p-6">
      <PageHeading heading="Policy Holder Management" />
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-4">
            <Col md={7}>
              <Form.Control
                type="text"
                placeholder="Search by Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md={5} className="d-grid d-md-flex justify-content-md-end">
              <Button
                onClick={handleShowCreatePolicyHolder}
                variant="outline-primary"
              >
                New Policy Holder
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
              data={filteredPolicyHolder}
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

      {/* 🔍 Lead Picker Modal */}
      <Modal
        show={showLeadPicker}
        onHide={() => setShowLeadPicker(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Lead (Optional)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Search Lead by Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Type lead name..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
            />
          </Form.Group>

          {loadingLeads ? (
            <div className="text-center py-3">
              <Spinner animation="border" />
            </div>
          ) : filteredLeads.length > 0 ? (
            <div
              className="border rounded"
              style={{
                maxHeight: "250px",
                overflowY: "auto",
              }}
            >
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-2 border-bottom hover:bg-light"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelectLead(lead)}
                >
                  <strong>
                    {lead.firstName} {lead.lastName}
                  </strong>
                  <div className="small text-muted">
                    {lead.email || lead.phoneNumber || "No contact info"}
                  </div>
                </div>
              ))}
            </div>
          ) : leadSearch.trim() ? (
            <div className="text-center text-muted py-2">No matching leads</div>
          ) : (
            <div className="text-center text-muted py-2">
              Start typing to search
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLeadPicker(false)}>
            Cancel
          </Button>
          <Button variant="outline-primary" onClick={handleSkipLead}>
            Not from Lead
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ➕ Create Modal */}
      <PolicyHolderCreateModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={fetchPolicyHolder}
        lead={selectedLead}
      />

      {/* ✏️ Update Modal */}
      <UpdatePolicyHolderModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchPolicyHolder}
        policyHolder={selectedPolicyHolder}
      />

      <BillingPaymentModal
        show={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={fetchPolicyHolder}
        billings={billings}
      />
    </Container>
  );
}
