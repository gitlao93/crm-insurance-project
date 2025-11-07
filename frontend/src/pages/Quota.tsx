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
import DataTable, { type TableColumn } from "react-data-table-component";
import { quotaService, type Quota } from "../services/quotaService";
import { PencilSquare } from "react-bootstrap-icons";

export default function Quota() {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<Quota[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedQuota, setSelectedQuota] = useState<Quota | null>(null);
  const [formData, setFormData] = useState({ month: "", targetPolicies: "" });

  // Fetch all quotas
  const fetchQuota = useCallback(async () => {
    try {
      setLoading(true);
      const agencyId = userObj?.agencyId;
      if (!agencyId) throw new Error("No agency info");
      const response = await quotaService.getAll(agencyId);
      setQuota(response);
    } catch (err) {
      console.error("Failed to fetch quotas", err);
      setQuota([]);
    } finally {
      setLoading(false);
    }
  }, [userObj?.agencyId]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  // Filter function with month name support
  const filteredQuota = quota.filter((u) => {
    const monthValue = String(u.month ?? "");
    const monthNumber = Number(u.month);
    const monthName = !isNaN(monthNumber)
      ? new Date(0, monthNumber - 1).toLocaleString("default", {
          month: "long",
        })
      : monthValue;

    const searchTerm = search.toLowerCase();
    return (
      monthName.toLowerCase().includes(searchTerm) ||
      monthValue.toLowerCase().includes(searchTerm)
    );
  });

  const handleEdit = (quota: Quota) => {
    setSelectedQuota(quota);
    setFormData({
      month: quota.month?.toString() ?? "",
      targetPolicies: quota.targetPolicies?.toString() ?? "",
    });
    setShowEdit(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        month: String(Number(formData.month)),
        targetPolicies: Number(formData.targetPolicies),
        year: new Date().getFullYear(), // ✅ optional, if backend expects it
        adminId: userObj.id, // ✅ matches your CreateQuotaRequest interface
      };
      await quotaService.create(payload);
      setShowCreate(false);
      setFormData({ month: "", targetPolicies: "" });
      fetchQuota();
    } catch (err) {
      console.error("Failed to create quota", err);
    }
  };

  const handleUpdate = async () => {
    if (!selectedQuota) return;
    try {
      const payload = {
        ...formData,
        month: String(Number(formData.month)),
        targetPolicies: Number(formData.targetPolicies),
      };
      await quotaService.updateQuota(selectedQuota.id, payload); // ✅ correct function
      setShowEdit(false);
      setSelectedQuota(null);
      setFormData({ month: "", targetPolicies: "" });
      fetchQuota();
    } catch (err) {
      console.error("Failed to update quota", err);
    }
  };

  const columns: TableColumn<Quota>[] = [
    {
      name: "Month",
      selector: (row) => {
        const monthNumber = Number(row.month);
        const monthName = isNaN(monthNumber)
          ? row.month
          : new Date(0, monthNumber - 1).toLocaleString("default", {
              month: "long",
            });
        return monthName;
      },
      sortable: true,
    },
    {
      name: "Year",
      selector: (row) => row.year ?? "",
    },
    {
      name: "Target Policies",
      selector: (row) => row.targetPolicies ?? "",
    },
    {
      name: "Actions",
      cell: (row) => (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-edit-${row.id}`}>Edit Quota</Tooltip>}
        >
          <span
            role="button"
            onClick={() => handleEdit(row)}
            style={{ cursor: "pointer" }}
          >
            <PencilSquare size={18} className="text-primary" />
          </span>
        </OverlayTrigger>
      ),
      ignoreRowClick: true,
    },
  ];

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

  return (
    <Container fluid className="p-6">
      <PageHeading heading="Quota Management" />
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-4">
            <Col md={7}>
              <Form.Control
                type="text"
                placeholder="Search ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md={5} className="d-grid d-md-flex justify-content-md-end">
              <Button
                onClick={() => setShowCreate(true)}
                variant="outline-primary"
              >
                Create Quota
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
              data={filteredQuota}
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

      {/* ✅ Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Quota</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Month</Form.Label>
              <Form.Select
                value={formData.month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    month: String(Number(e.target.value)),
                  })
                }
                required
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Policies</Form.Label>
              <Form.Control
                type="number"
                value={formData.targetPolicies}
                onChange={(e) =>
                  setFormData({ ...formData, targetPolicies: e.target.value })
                }
                placeholder="Enter target policies"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Quota</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Month</Form.Label>
              <Form.Select
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: e.target.value })
                }
                required
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Target Policies</Form.Label>
              <Form.Control
                type="number"
                value={formData.targetPolicies}
                onChange={(e) =>
                  setFormData({ ...formData, targetPolicies: e.target.value })
                }
                placeholder="Enter target policies"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
