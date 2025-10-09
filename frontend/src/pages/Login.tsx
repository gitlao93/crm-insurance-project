//import node module libraries
import { Row, Col, Card, Form, Button, Image } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useMounted } from "../hooks/useMounted";
import { useState } from "react";
import AuthService from "../services/authService";

//import custom hook

const Login = () => {
  const hasMounted = useMounted();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AuthService.login({ email, password });
      navigate("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Row className="align-items-center justify-content-center g-0 min-vh-100">
      <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
        <Card className="smooth-shadow-md">
          <Card.Body className="p-6">
            <div className="d-flex flex-column justify-content-center align-items-center">
              <Link to="/home" className="mx-auto">
                <Image src="/images/brand/goodlife-logo.png" alt="" />
              </Link>
              <h1 className="mb-6">Goodlife Damayanan</h1>
            </div>

            {hasMounted && (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="username"
                    placeholder="Enter address here"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    placeholder="**************"
                    required
                  />
                </Form.Group>
                {error && <p className="text-danger">{error}</p>}

                {/* <div className="d-lg-flex justify-content-between align-items-center mb-4">
                  <Form.Check type="checkbox" id="rememberme">
                    <Form.Check.Input type="checkbox" />
                    <Form.Check.Label>Remember me</Form.Check.Label>
                  </Form.Check>
                </div> */}
                <div>
                  <div className="d-grid">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                  {/* <div className="d-md-flex justify-content-between mt-4">
                    <div className="mb-2 mb-md-0">
                      <Link to="/auth/sign-up" className="fs-5">
                        Create An Account{" "}
                      </Link>
                    </div>
                    <div>
                      <Link
                        to="/auth/forget-password"
                        className="text-inherit fs-5"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </div> */}
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
