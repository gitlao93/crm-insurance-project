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

import DataTable, { type TableColumn } from "react-data-table-component";
import { PencilSquare } from "react-bootstrap-icons";
import {
  policyCategoryService,
  policyPlanService,
  type PolicyCategory,
  type PolicyPlan,
} from "../services/policyServices";
import PolicyPlanCreateModal from "./policy-modal/PolicyPlanCreateModal";
import PolicyPlanEditModal from "./policy-modal/PolicyPlanEditModal";

export default function PolicyPlan() {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PolicyPlan[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PolicyPlan | null>();
  const [showEdit, setShowEdit] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [category, setCategory] = useState<PolicyCategory[]>([]);

  const fetchPolicyPlan = useCallback(async () => {
    try {
      setLoading(true);
      const agencyId = userObj?.agencyId;
      if (!agencyId) throw new Error("No agency info");
      const response = await policyPlanService.getPlans();
      setPlan(response);
    } catch (err) {
      console.error("Failed to fetch Plans", err);
      setPlan([]);
    } finally {
      setLoading(false);
    }
  }, [userObj?.agencyId]);
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

  const filteredCategory = plan.filter((u) => {
    const matchesSearch = u.policyName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = categoryFilter
      ? u.category?.categoryName === categoryFilter
      : true;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchPolicyPlan();
    fetchPolicyCategory();
  }, [fetchPolicyPlan, fetchPolicyCategory]);

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

  const columns: TableColumn<PolicyPlan>[] = [
    {
      name: "Categories",
      selector: (row) => row.category?.categoryName ?? "",
      sortable: true,
    },
    {
      name: "Policy Name",
      selector: (row) => row.policyName,
      sortable: true,
    },
    {
      name: "Type",
      selector: (row) => row.policyType,
    },
    {
      name: "Premium",
      selector: (row) => row.premium,
    },
    {
      name: "Term",
      selector: (row) => row.term,
    },
    {
      name: "Duration(Years)",
      selector: (row) => row.duration + " " + "yrs",
    },
    {
      name: "Commition(%)",
      selector: (row) => row.commission_rate + " " + "%",
    },
    {
      name: "Status",
      selector: (row) => row.status,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-edit-${row.id}`}>Edit Plan Catalog</Tooltip>
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
    },
  ];

  const handleEdit = (plan: PolicyPlan) => {
    setSelectedPlan(plan);
    setShowEdit(true);
  };
  return (
    <Container fluid className="p-6">
      <PageHeading heading="Policy Catalog Management" />
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-4">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search by Plan Name or Category"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Category</option>
                {category.map((e) => {
                  return (
                    <option key={e.id} value={e.categoryName}>
                      {e.categoryName}
                    </option>
                  );
                })}
              </Form.Select>
            </Col>
            <Col md={5} className="d-grid d-md-flex justify-content-md-end">
              <Button
                onClick={() => setShowCreate(true)}
                variant="outline-primary"
              >
                Add New Policy
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
      <PolicyPlanEditModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={fetchPolicyPlan}
        policyPlan={selectedPlan ?? null}
        category={category}
      />
      <PolicyPlanCreateModal
        show={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={fetchPolicyPlan}
        category={category}
      />
    </Container>
  );
}
