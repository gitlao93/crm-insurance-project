import { useEffect, useState } from "react";
import {
  Container,
  Navbar,
  Nav,
  Row,
  Col,
  Button,
  Form,
  Card,
  Image,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  policyHolderService,
  PolicyHolderStatus,
  type PolicyHolder,
} from "../services/policyHolderService";
import {
  claimService,
  type CreateClaimRequest,
} from "../services/claimService";
type ClaimType = "Death" | "Burial" | "Accident" | "Hospitalization";

export default function GoodlifeDamayanPage() {
  const navigate = useNavigate();
  const [policyNumber, setPolicyNumber] = useState("");
  const [policyHolder, setPolicyHolder] = useState<PolicyHolder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  // ✅ Make it non-nullable
  const [selectedBenefits, setSelectedBenefits] = useState<
    Partial<Record<ClaimType, number>>
  >({});

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!policyNumber) {
      setPolicyHolder(null);

      setError(null);
      return;
    }
    console.log(policyNumber);
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await policyHolderService.findPolicyHolder(policyNumber);
        console.log("policy holder: ", data);
        if (data.status === PolicyHolderStatus.CANCELLED) {
          setError("This policy is CANCELLED please visit the office.");
          return;
        }

        setPolicyHolder(data);
        setError(null);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      } catch (err: any) {
        setPolicyHolder(null);
        setError("Policy number not found.");
      } finally {
        setLoading(false);
      }
    }, 700);

    return () => clearTimeout(timeout);
  }, [policyNumber]);

  // ✅ Check if entered details match fetched policyholder
  const infoMatch =
    policyHolder &&
    firstName.toLowerCase() === policyHolder.firstName.toLowerCase() &&
    lastName.toLowerCase() === policyHolder.lastName.toLowerCase() &&
    phoneNumber.toLowerCase() ===
      (policyHolder.phoneNumber ?? "").toLowerCase() &&
    email.toLowerCase() === (policyHolder.email ?? "").toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!policyHolder) {
      setError("Please enter a valid policy number.");
      return;
    }

    if (policyHolder.status === PolicyHolderStatus.CANCELLED) {
      setError("Claims can only be filed on ACTIVE policies.");
      return;
    }

    if (!infoMatch) {
      setError("Provided information does not match our records.");
      return;
    }

    if (Object.keys(selectedBenefits).length === 0) {
      setError("Please select at least one benefit to claim.");
      return;
    }

    const payload: CreateClaimRequest = {
      policyHolderId: policyHolder.id,
      claimType: selectedBenefits,
      description: description,
      dateFiled: new Date(),
    };

    try {
      setLoading(true);
      await claimService.createClaim(payload);
      setSelectedBenefits({});
      setDescription("");
      setPolicyHolder(null);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setDescription("");
      setPolicyNumber("");
      setAcknowledged(false);
      setError(null);
      setSuccessMessage(
        "Your claim has been filed. Please visit our office with the required documents for validation. Your agent will contact you for assistance.!"
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError("Failed to submit claim. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Navigation */}
      <Navbar bg="light" expand="lg" fixed="top" className="shadow-sm">
        <Container>
          <Navbar.Brand href="#home" className="fw-bold fs-4">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="avatar avatar-md avatar-indicators avatar-online">
                <Image
                  alt="avatar"
                  src="/images/brand/goodlife-logo.png"
                  className="rounded-circle"
                />
              </div>
              <div className="mx-4">
                <h3 className="fw-bold lead mb-0">GOOD LIFE</h3>
                <h3 className="fw-bold lead mb-0">DAMAYAN</h3>
              </div>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link onClick={() => scrollToSection("home")}>Home</Nav.Link>
              <Nav.Link onClick={() => scrollToSection("about")}>
                About
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection("services")}>
                Services
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection("coverage")}>
                Product & Coverage
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection("contact")}>
                Contact
              </Nav.Link>
              <Nav.Link onClick={() => scrollToSection("claim")}>
                File Claim
              </Nav.Link>
            </Nav>
            <Button onClick={() => navigate("/login")}>Login</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section
        id="home"
        style={{
          paddingTop: "100px",
          paddingBottom: "80px",
          backgroundColor: "#f8f9fa",
          height: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={8} className="mx-auto text-center">
              <div className="mb-3">
                <span className="badge bg-success">
                  Trusted Insurance Partner
                </span>
              </div>
              <h1 className="display-3 fw-bold mb-4">
                We Take Care of Your Good Life
              </h1>
              <p className="lead mb-4 text-muted">
                Goodlife Damayan provides comprehensive insurance solutions
                designed to protect what matters most. Join thousands of
                families who trust us with their security and peace of mind.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button
                  variant="dark"
                  size="lg"
                  onClick={() => scrollToSection("claim")}
                >
                  File a Claim
                </Button>
                <Button
                  variant="outline-dark"
                  size="lg"
                  onClick={() => scrollToSection("about")}
                >
                  Learn More
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* About Section */}
      <section
        id="about"
        style={{
          paddingTop: "80px",
          paddingBottom: "80px",
          height: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row>
            <Col lg={10} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4 text-center">
                About Goodlife Damayan
              </h2>
              <p className="lead text-center text-muted mb-5">
                Building trust through reliable insurance coverage since our
                founding
              </p>
              <Row className="g-4">
                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-4">
                      <Card.Title className="fw-bold">Mission</Card.Title>
                      <Card.Text className="text-muted">
                        tions to Filipino families, ensuring peace of mind and
                        financial protection against life’s uncertainties."
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-4">
                      <Card.Title className="fw-bold">Vision</Card.Title>
                      <Card.Text className="text-muted">
                        "To be the leading micro pre-need insurance provider in
                        the Philippines, empowering every Filipino family to
                        secure their future with confidence and ease."
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Section */}
      <section
        id="services"
        style={{
          paddingTop: "80px",
          paddingBottom: "80px",
          backgroundColor: "#f8f9fa",
          height: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row>
            <Col lg={10} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4 text-center">
                Our Services
              </h2>
              <p className="lead text-center text-muted mb-5">
                Comprehensive insurance solutions for every stage of life
              </p>
              <Row className="g-4">
                <Col md={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-4">
                      <h4 className="fw-bold mb-3">Insurance</h4>
                      <Card.Text className="text-muted">
                        Affordable insurance plans offering peace of mind and
                        security to Filipino families.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-4">
                      <h4 className="fw-bold mb-3">Memorial</h4>
                      <Card.Text className="text-muted">
                        Services provided by Goodlife Memorial Chapels Co.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-4">
                      <h4 className="fw-bold mb-3">Savings & Credit</h4>
                      <Card.Text className="text-muted">
                        Offered through the Goodlife Savings & Credit
                        Cooperative.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-4">
                      <h4 className="fw-bold mb-3">Humanitarian</h4>
                      <Card.Text className="text-muted">
                        Initiatives managed by the Goodlife Community Cares
                        Foundation Inc
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Coverage Section */}
      <section
        id="coverage"
        style={{
          paddingTop: "80px",
          paddingBottom: "80px",
          height: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row>
            <Col lg={10} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4 text-center">
                Products & Coverage
              </h2>
              <Row className="g-4">
                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-4">
                      <Card.Title className="fw-bold">
                        Individual Insurance
                      </Card.Title>
                      <Card.Text className="text-muted">
                        Coverage for individuals aged 18 to 65, with benefits
                        including Family Cash Assistance, Accidental Death,
                        Beneficiary Assistance, and Burial Assistance.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-4">
                      <Card.Title className="fw-bold">
                        Family (4-in-1) Insurance
                      </Card.Title>
                      <Card.Text className="text-muted">
                        A unique offering that covers the member and up to three
                        dependents, providing comprehensive protection under a
                        single plan.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        style={{
          paddingTop: "80px",
          paddingBottom: "80px",
          backgroundColor: "#f8f9fa",
          height: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row>
            <Col lg={10} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4 text-center">Contact Us</h2>
              <Row className="g-4">
                <Col md={12}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-4">
                      <Card.Title className="fw-bold">Address</Card.Title>
                      <Card.Text className="text-muted">
                        FJGP+JH9, J. Seriña St, Cagayan De Oro City, Misamis
                        Oriental
                      </Card.Text>
                      <Card.Title className="fw-bold">Phone</Card.Title>
                      <Card.Text className="text-muted">
                        0945 802 3830
                      </Card.Text>
                      <Card.Title className="fw-bold">Office Hours</Card.Title>

                      <ul style={{ listStyleType: "none" }}>
                        <li className="text-muted">
                          Monday to Friday: 8:00 AM – 5:00 PM
                        </li>
                        <li className="text-muted">Saturday: Opens 8:00 AM</li>
                        <li className="text-muted">Sunday: Closed</li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Claim Form Section */}
      <section
        id="claim"
        style={{
          paddingTop: "80px",
          paddingBottom: "80px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4 text-center">
                File a Claim
              </h2>
              <Card className="border-0 shadow">
                <Card.Body className="p-4 p-md-5">
                  <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Policy Holders First Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your first name"
                            size="lg"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Policy Holders Last Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your last name"
                            size="lg"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Policy Holders Email Address
                          </Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="your.email@example.com"
                            size="lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Policy Holders Phone Number
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            placeholder="09XXXXXXXXX"
                            size="lg"
                            value={phoneNumber}
                            maxLength={11} // ✅ prevents more than 11 characters
                            onChange={(e) => {
                              // ✅ allow only digits, and limit to 11
                              const input = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 11);
                              setPhoneNumber(input);
                            }}
                          />
                        </Form.Group>
                      </Col>
                      {policyHolder && !error && (
                        <Col xs={12}>
                          {infoMatch ? (
                            <Alert variant="success">
                              ✅ Your information matches our records.
                            </Alert>
                          ) : (
                            <Alert variant="warning">
                              ⚠️ Policy found, but your provided information
                              doesn’t match our records.
                            </Alert>
                          )}
                        </Col>
                      )}
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Policy Number
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your policy number"
                            size="lg"
                            value={policyNumber}
                            onChange={(e) => setPolicyNumber(e.target.value)}
                          />
                          {loading && (
                            <Spinner
                              animation="border"
                              size="sm"
                              className="mt-2"
                            />
                          )}
                          {error && (
                            <Alert variant="danger" className="mt-2">
                              {error}
                            </Alert>
                          )}
                          {policyHolder && !error && (
                            <Alert variant="success" className="mt-2">
                              ✅ Policy found
                            </Alert>
                          )}
                        </Form.Group>
                      </Col>

                      {policyHolder?.policyPlan?.benefits && (
                        <Col xs={12}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Eligible Benefits
                            </Form.Label>
                            <div className="d-flex flex-wrap gap-3">
                              {Object.entries(
                                policyHolder.policyPlan.benefits
                              ).map(([benefit, amount]) => {
                                const typedBenefit = benefit as ClaimType;
                                const isChecked =
                                  selectedBenefits[typedBenefit] !== undefined;
                                return (
                                  <Form.Check
                                    key={benefit}
                                    type="checkbox"
                                    id={`benefit-${benefit}`}
                                    label={`${benefit} — ₱${Number(
                                      amount
                                    ).toLocaleString()}`}
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedBenefits((prev) => ({
                                          ...prev,
                                          [typedBenefit]: Number(amount),
                                        }));
                                      } else {
                                        setSelectedBenefits((prev) => {
                                          const updated = { ...prev };
                                          delete updated[typedBenefit];
                                          return updated;
                                        });
                                      }
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </Form.Group>
                        </Col>
                      )}

                      {/* --- ✅ Description Field --- */}
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Description
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Provide more details about your claim..."
                            size="lg"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </Form.Group>
                      </Col>

                      {/* --- ✅ Requirements Reminder Section --- */}
                      <Col xs={12}>
                        <Card className="border-0 bg-light mt-3">
                          <Card.Body>
                            <h5 className="fw-bold mb-3">
                              📋 Initial Requirements Checklist
                            </h5>
                            <p className="text-muted mb-2">
                              Please ensure you have these ready for submission
                              onsite.
                            </p>
                            <div className="d-flex flex-column gap-2">
                              <Form.Check
                                type="checkbox"
                                label="Death Certificate (if applicable)"
                                disabled
                                checked
                              />
                              <Form.Check
                                type="checkbox"
                                label="Medical Certificate (if applicable)"
                                disabled
                                checked
                              />
                              <Form.Check
                                type="checkbox"
                                label="Valid ID of Beneficiary"
                                disabled
                                checked
                              />
                              <Form.Check
                                type="checkbox"
                                label="Other supporting documents as required"
                                disabled
                                checked
                              />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      {/* --- ✅ Acknowledgement Checkbox --- */}
                      <Col xs={12}>
                        <Form.Group className="mt-3">
                          <Form.Check
                            type="checkbox"
                            id="acknowledgement"
                            label="I understand that I need to submit the required supporting documents onsite for this claim to be processed."
                            checked={acknowledged}
                            onChange={(e) => setAcknowledged(e.target.checked)}
                            required
                          />
                        </Form.Group>
                      </Col>

                      {successMessage && (
                        <Alert variant="success" className="mt-3">
                          {successMessage}
                        </Alert>
                      )}

                      <Col xs={12}>
                        <Button
                          type="submit"
                          variant="dark"
                          size="lg"
                          className="w-100"
                          disabled={loading}
                        >
                          {loading ? "Submitting..." : "Submit Claim"}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer
        style={{
          paddingTop: "60px",
          paddingBottom: "60px",
          backgroundColor: "#212529",
        }}
      >
        <Container>
          <Row>
            <Col lg={12} className="text-center">
              <h5 className="text-white fw-bold mb-3">Goodlife Damayan</h5>
              <p className="text-white-50 mb-4">
                Your trusted partner in insurance and financial security
              </p>
              <p className="text-white-50 small mb-0">
                © 2025 Goodlife Damayan. All rights reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}
