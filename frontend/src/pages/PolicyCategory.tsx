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
import { useCallback, useEffect, useState } from "react";
import {
  policyCategoryService,
  type PolicyCategory,
} from "../services/policyServices";
import DataTable, { type TableColumn } from "react-data-table-component";
import { PencilSquare } from "react-bootstrap-icons";
import PolicyCategoryCreateModal from "./policy-modal/PolicyCategoryCreateModal";
import PolicyCategroyEditModal from "./policy-modal/PolicyCategoryEditModal";

export default function PolicyCategory() {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<PolicyCategory[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<PolicyCategory | null>();
  const [showEdit, setShowEdit] = useState(false);

  const fetchPolicyCategory = useCallback(async () => {
    try {
      setLoading(true);
      const agencyId = userObj?.agencyId;
      if (!agencyId) throw new Error("No agency info");
      const response = await policyCategoryService.getCategories(agencyId);
      setCategory(response);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setCategory([]);
    } finally {
      setLoading(false);
    }
  }, [userObj?.agencyId]);

  const filteredCategory = category.filter((u) => {
    const matchesSearch =
      (u.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.categoryName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    fetchPolicyCategory();
  }, [fetchPolicyCategory]);

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

  const columns: TableColumn<PolicyCategory>[] = [
    {
      name: "categoryName",
      selector: (row) => row.categoryName,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description ?? "",
    },
    {
      name: "Active plans",
      selector: (row) => row.plans?.length ?? 0,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-edit-${row.id}`}>
                Edit Plan Category
              </Tooltip>
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
      allowOverflow: true,
      button: true,
    },
  ];

  const handleEdit = (category: PolicyCategory) => {
    setSelectedCategory(category);
    setShowEdit(true);
  };
  return (
    <Container fluid className="p-6">
      <PageHeading heading="Policy Category Management" />
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-4">
            <Col md={7}>
              <Form.Control
                type="text"
                placeholder="Search by Category name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>

            <Col md={5} className="d-grid d-md-flex justify-content-md-end">
              <Button
                onClick={() => setShowCreate(true)}
                variant="outline-primary"
              >
                Add Category
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
              data={filteredCategory}
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
      <PolicyCategroyEditModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={fetchPolicyCategory}
        policyCategory={selectedCategory ?? null}
      />
      <PolicyCategoryCreateModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={fetchPolicyCategory}
      />
    </Container>
  );
}
