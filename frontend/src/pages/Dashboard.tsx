import { Container } from "react-bootstrap";
import PageHeading from "../widgets/PageHeading";

export default function Dashboard() {
  return (
    <Container fluid className="p-6">
      <PageHeading heading="Dashboard" />
    </Container>
  );
}
