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
import DataTable, { type TableColumn } from "react-data-table-component";
import { useCallback, useEffect, useState } from "react";
import { PencilSquare } from "react-bootstrap-icons";
import {
  claimService,
  ClaimStatus,
  type Claim,
} from "../services/claimService";

export default function ClaimRequest() {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "">("");
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [newStatus, setNewStatus] = useState<ClaimStatus | "">("");
  const [remarks, setRemarks] = useState("");

  /** 🔹 Fetch all claims */
  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const agencyId = userObj?.agencyId;
      if (!agencyId) throw new Error("No agency info");
      const response = await claimService.getClaims(agencyId);
      setClaims(response);
    } catch (err) {
      console.error("Failed to fetch claims", err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [userObj?.agencyId]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  /** 🔹 Filter logic */
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.policyHolder.firstName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      claim.policyHolder.lastName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /** 🔹 Handle Edit click */
  const handleEdit = (claim: Claim) => {
    setSelectedClaim(claim);
    setNewStatus(claim.status);
    setRemarks(claim.remarks || "");
  };

  /** 🔹 Handle Save in modal */
  const handleSave = async () => {
    if (!selectedClaim || !newStatus) return;

    try {
      setLoading(true);

      // Explicitly match the expected UpdateClaimRequest structure
      const updatePayload = {
        status: newStatus,
        dateProcessed: new Date(),
        processedBy: Number(userObj.id), // ✅ ensure it's a number
        remarks:
          newStatus === ClaimStatus.REJECTED ? remarks.trim() || null : null,
      };

      await claimService.updateClaim(selectedClaim.id, updatePayload);

      setSelectedClaim(null);
      setRemarks("");
      await fetchClaims(); // refresh data
    } catch (error) {
      console.error("Failed to update claim:", error);
    } finally {
      setLoading(false);
    }
  };
  /** 🔹 Columns for DataTable */
  const columns: TableColumn<Claim>[] = [
    {
      name: "Agent",
      selector: (row) =>
        `${row.policyHolder.agent.firstName} ${row.policyHolder.agent.lastName}`,
      sortable: true,
    },
    {
      name: "Policy Holder",
      selector: (row) =>
        `${row.policyHolder.firstName} ${row.policyHolder.lastName}`,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.policyHolder.email ?? "",
    },
    {
      name: "Description",
      selector: (row) => row.description ?? "",
    },
    {
      name: "Claim Type",
      selector: (row) => {
        const types = Object.keys(row.claimType ?? {});
        return types.length ? types.join(", ") : "-";
      },
      sortable: true,
    },
    {
      name: "Date Filed",
      selector: (row) =>
        row.dateFiled
          ? new Date(row.dateFiled).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "",
    },
    {
      name: "Status",
      selector: (row) => row.status,
    },
    {
      name: "Remarks",
      selector: (row) => row.remarks ?? "-",
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div style={{ overflow: "visible" }} className="d-flex gap-2">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-edit-${row.id}`}>Edit Status</Tooltip>
            }
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
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  /** 🔹 Custom table style */
  const customStyles = {
    table: {
      style: {
        minHeight: "500px",
        padding: "10px",
      },
    },
  };

  const paginationComponentOptions = {
    rowsPerPageText: "Rows per page",
    rangeSeparatorText: "of",
  };

  return (
    <Container fluid className="p-6">
      <PageHeading heading="Claims Management" />

      <Card className="mb-4">
        <Card.Body>
          {/* 🔹 Search + Filter */}
          <Row className="mb-4 g-3 align-items-center">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="Search by policy holder name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ClaimStatus | "")
                }
              >
                <option value="">All Status</option>
                <option value={ClaimStatus.PENDING}>
                  {ClaimStatus.PENDING}
                </option>
                <option value={ClaimStatus.APPROVED}>
                  {ClaimStatus.APPROVED}
                </option>
                <option value={ClaimStatus.REJECTED}>
                  {ClaimStatus.REJECTED}
                </option>
                <option value={ClaimStatus.PAID}>{ClaimStatus.PAID}</option>
              </Form.Select>
            </Col>
          </Row>

          {/* 🔹 Table */}
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredClaims}
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

      {/* 🔹 Edit Modal */}
      <Modal
        show={!!selectedClaim}
        onHide={() => setSelectedClaim(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Claim Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ClaimStatus)}
            >
              <option value="">Select Status</option>
              <option value={ClaimStatus.PENDING}>{ClaimStatus.PENDING}</option>
              <option value={ClaimStatus.APPROVED}>
                {ClaimStatus.APPROVED}
              </option>
              <option value={ClaimStatus.REJECTED}>
                {ClaimStatus.REJECTED}
              </option>
              <option value={ClaimStatus.PAID}>{ClaimStatus.PAID}</option>
            </Form.Select>
          </Form.Group>

          {/* 🔹 Remarks field (only show when REJECTED) */}
          {newStatus === ClaimStatus.REJECTED && (
            <Form.Group>
              <Form.Label>Remarks / Reason for Rejection</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Provide the reason for rejection..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedClaim(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
