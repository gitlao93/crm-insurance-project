import { Col, Container, Nav, Row, Tab } from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";

export default function Message() {
  return (
    <Container fluid className="p-6">
      <PageHeading heading="Message" />
      <Tab.Container>
        <Row>
          <Col sm={2}>
            <h4>Channels</h4>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="#">Home</Nav.Link>
              </Nav.Item>
            </Nav>
            <h4>Direct Messages</h4>
            <Nav variant="pills" className="flex-column pt-4">
              <Nav.Item>
                <Nav.Link eventKey="home">Home</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col sm={10}>
            <Tab.Content>
              <Tab.Pane eventKey="home"></Tab.Pane>
              <Tab.Pane eventKey="profile"></Tab.Pane>
              <Tab.Pane eventKey="messages"></Tab.Pane>
              <Tab.Pane eventKey="settings"></Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}
