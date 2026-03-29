import Diskreta from "components/Diskreta";
import { useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import useHandleRecovery from "./handlers/useHandleRecovery";
import useHandleSubmit from "./handlers/useHandleSubmit";

export default function Login() {

    const [nick, setNick] = useState("");
    const [password, setPassword] = useState("");

    const { handleSubmit, loading } = useHandleSubmit(nick, password)
    const handleRecovery = useHandleRecovery(nick, password)

    return <Container className="my-auto">
        <Row className="h-100">
            <Col lg={4} className="mx-auto p-5 bg-dark">
                <div className="text-white"><Diskreta /></div>
                <h6 className="text-white text-center mb-3">Login</h6>

                <Form className="enter-form d-flex flex-column" onSubmit={handleSubmit}>
                    <Form.Control onChange={e => { setNick(e.target.value) }} value={nick} className="bg-transparent text-white rounded-0 mb-3" type="text" placeholder="Username" />
                    <InputGroup className="mb-1">
                        <Form.Control onChange={e => { setPassword(e.target.value) }} value={password} className="bg-transparent text-white rounded-0 mb-0 me-2" type="password" placeholder="Password" />

                        <Button
                            variant="outline-secondary"
                            className="rounded-0 forgot border-3"
                            onClick={handleRecovery}
                        >
                            Recover
                        </Button>
                    </InputGroup>

                    <Button type="submit"
                        variant="outline-info"
                        className="d-flex justify-content-center align-items-center ms-auto w-50 my-3 rounded-0 font-monospace login border-3"
                        disabled={loading}
                    >
                        {
                            loading &&
                            <div style={{ transform: 'scale(0.5) translateY(5%)' }}>
                                <Spinner />
                            </div>
                        }
                        Login
                    </Button>

                    <Link to="/register" className="text-warning text-decoration-none">Don't have an account?</Link>

                </Form>
            </Col>
        </Row>
    </Container>
}