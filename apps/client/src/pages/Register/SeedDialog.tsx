import { Alert, Col, Container, Row } from "react-bootstrap";

export default function SeedDialog({ seed }: { seed: string }) {
    return <Container>
        <Row>
            <Col className="p-5">
                <Alert variant="warning" className="rounded-0 p-4 text-warning bg-transparent border-3">
                    <h2 className="m-0">⚠️ Warning</h2>
                </Alert>
                <h2>Do not screenshot this, do not copy paste this.</h2>
                <h6 className="my-4">We will only display the following seed once. <br /> Please make sure to write it down on paper and store it somewhere safe to recover your account and decrypt the message history if you forget your password.</h6>
                <Row className="font-monospace pt-4 px-2 px-md-5">
                    <Col xs={6}>
                        <ol>
                            {seed.split(' ').slice(0, 12).map((word, i) => <li key={`li-${i}`}>{word}</li>)}
                        </ol>
                    </Col>
                    <Col xs={6}>
                        <ol start={13}>
                            {seed.split(' ').slice(12).map((word, i) => <li key={`li-${i + 12}`}>{word}</li>)}
                        </ol>
                    </Col>
                </Row>

            </Col>
        </Row>
    </Container>
}