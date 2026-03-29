import { refreshToken } from "API/refreshToken";
import { focusState } from "atoms/focus";
import { userState } from "atoms/user";
import { USER_DIGEST } from "constants/localStorage";
import useActiveChat from "hooks/useActiveChat";
import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { isTokenExpired } from "util/isTokenExpired";
import Chat from "./Chat";
import Conversations from "./Conversations";
import SideHeader from "./SideHeader";

export default function Main() {

    const navigate = useNavigate()

    const user = useRecoilValue(userState)
    const hasFocus = useRecoilValue(focusState)

    const { activeChatId } = useActiveChat()
    const { token } = user || {}

    const userExists = !!user

    useEffect(() => {
        if (!userExists) {
            !localStorage.getItem(USER_DIGEST)
                ? navigate("/register")
                : navigate("/login")
        }
    }, [userExists, navigate])

    useEffect(() => {
        hasFocus && !!token && isTokenExpired(token) && refreshToken()
    }, [hasFocus, token])

    return <Container className="pt-5 pb-4 h-100">
        <Row className="h-100 flex-column flex-md-row" style={{ margin: 'auto' }}>
            <Col xs={12} md={4} id="main-left" style={{ overflow: 'auto' }} data-active-chat={!!activeChatId}>
                <SideHeader />
                <hr />
                <Conversations />
            </Col>
            <Col xs={12} md={8} id="main-right"
                className="flex-grow-1"
                data-active-chat={!!activeChatId}>
                <Chat />
            </Col>
        </Row>
    </Container>
}