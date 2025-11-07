import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <Container className="text-center mt-5">
      <h1 className="display-4 text-danger">403</h1>
      <p className="lead">You don’t have permission to access this page.</p>
      <Button onClick={() => navigate("/dashboard")} variant="primary">
        Go to Dashboard
      </Button>
    </Container>
  );
}
