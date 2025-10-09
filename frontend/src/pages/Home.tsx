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
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function GoodlifeDamayanPage() {
  const navigate = useNavigate();
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* Navigation */}
      <Navbar bg="light" expand="lg" fixed="top" className="shadow-sm">
        <Container>
          <Navbar.Brand href="#home" className="fw-bold fs-4">
            {/* <div
              style={{
                width: "150px",
                height: "40px",
                backgroundColor: "#e9ecef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
              }}
            >
              Goodlife Damayan
            </div> */}
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
      <section id="about" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
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
        style={{ paddingTop: "80px", paddingBottom: "80px" }}
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
                      <Card.Text className="text-muted">
                        <ul style={{ listStyleType: "none" }}>
                          <li className="text-muted">
                            Monday to Friday: 8:00 AM – 5:00 PM
                          </li>
                          <li className="text-muted">
                            Saturday: Opens 8:00 AM
                          </li>
                          <li className="text-muted">Sunday: Closed</li>
                        </ul>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Claim Form Section */}
      <section id="claim" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4 text-center">
                File a Claim
              </h2>
              <Card className="border-0 shadow">
                <Card.Body className="p-4 p-md-5">
                  <Form>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            First Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your first name"
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Last Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your last name"
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Email Address
                          </Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="your.email@example.com"
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Phone Number
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            placeholder="+63 XXX XXX XXXX"
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Policy Number (if applicable)
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your policy number"
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Inquiry Type
                          </Form.Label>
                          <Form.Select size="lg">
                            <option>Select an option</option>
                            <option>File a Claim</option>
                            <option>Request Information</option>
                            <option>Policy Question</option>
                            <option>General Inquiry</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Message
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder="Please provide details about your inquiry or claim..."
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Button variant="dark" size="lg" className="w-100">
                          Submit Request
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
