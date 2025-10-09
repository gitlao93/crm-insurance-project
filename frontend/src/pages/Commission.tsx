import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import PageHeading from "../widgets/PageHeading";
import {
  commissionService,
  type Commission,
} from "../services/commissionService";
import { BorderLeft } from "react-bootstrap-icons";

export default function CommissionPage() {
  const storedUser = localStorage.getItem("user") ?? "";
  const userObj = JSON.parse(storedUser);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState<Commission[]>([]);

  // --- Fetch Commissions ---
  const fetchCommissions = useCallback(async () => {
    try {
      setLoading(true);
      let response: Commission[];

      if (userObj?.role === "agent") {
        response = await commissionService.getByAgent(userObj.id);
      } else {
        response = await commissionService.getAll();
      }

      setCommissions(response);
    } catch (err) {
      console.error("Failed to fetch commissions", err);
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  }, [userObj?.role, userObj?.id]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  // --- Derived Values ---
  const filtered = commissions.filter((c) => {
    const matchesSearch =
      c.policyHolder?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      c.policyHolder?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      c.policyPlan?.policyName?.toLowerCase().includes(search.toLowerCase()) ||
      String(c.amount).includes(search);

    const matchesStatus =
      statusFilter === ""
        ? true
        : statusFilter === "Paid"
        ? c.paid === true
        : c.paid === false;

    return matchesSearch && matchesStatus;
  });

  // --- 🧮 Compute Totals ---
  const totalEarnings = useMemo(() => {
    return commissions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  }, [commissions]);

  // --- 📅 Monthly Breakdown ---
  const earningsPerMonth = useMemo(() => {
    const monthly: Record<string, number> = {};
    commissions.forEach((c) => {
      if (!c.createdAt) return;
      const date = new Date(c.createdAt);
      const monthKey = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthly[monthKey] = (monthly[monthKey] || 0) + Number(c.amount || 0);
    });
    return monthly;
  }, [commissions]);

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

  const columns: TableColumn<Commission>[] = [
    {
      name: "Policy Holder",
      selector: (row) =>
        `${row.policyHolder?.firstName ?? ""} ${
          row.policyHolder?.lastName ?? ""
        }`,
      sortable: true,
    },
    {
      name: "Policy Plan",
      selector: (row) => row.policyPlan?.policyName ?? "",
    },
    {
      name: "Collection",
      selector: (row) =>
        `₱${Number(row.billing?.amountPaid).toFixed(2) ?? 0.0}`,
      sortable: true,
    },
    {
      name: "Commission Amount",
      selector: (row) => `₱${Number(row.amount).toFixed(2)}`,
      sortable: true,
    },
  ];

  return (
    <Container fluid className="p-6">
      <PageHeading heading="Commission Management" />

      {/* 💰 Summary Section */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 p-1">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Earnings</h6>
              <h3 className="fw-bold text-success">
                ₱{totalEarnings.toFixed(2)}
              </h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="text-muted mb-3">Earnings per Month</h6>
              <div className="d-flex flex-wrap gap-3">
                {Object.entries(earningsPerMonth).length === 0 ? (
                  <p className="text-muted mb-0">No data available</p>
                ) : (
                  Object.entries(earningsPerMonth).map(([month, total]) => (
                    <div
                      key={month}
                      className="text-center px-2"
                      style={{ borderRight: "1px solid black" }}
                    >
                      <h6 className="mb-0">{month}</h6>
                      <span className="fw-bold text-primary">
                        ₱{total.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 📋 Table Section */}
      <Card>
        <Card.Body>
          {/* 🔎 Filters */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search by holder, plan, or amount"
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
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </Form.Select>
            </Col>

            <Col md={5} className="d-grid d-md-flex justify-content-md-end">
              <Button variant="outline-primary" onClick={fetchCommissions}>
                Refresh
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
              data={filtered}
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
