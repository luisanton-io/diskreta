import API from "API";
import { AxiosError } from "axios"
import { chatsState } from "atoms/chats";
import { dialogState } from "atoms/dialog";
import { userState } from "atoms/user";
import { useEffect, useRef, useState } from "react";
import { Col, Container, Form, ListGroup, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import createChatId from "util/createChatId";
import maskUser from "util/maskUser";
import { toast } from "react-toastify";

export default function SearchDialog() {
    const navigate = useNavigate()
    const [query, setQuery] = useState("")
    const setDialog = useSetRecoilState(dialogState)

    const timeout = useRef<NodeJS.Timeout>()
    const [debouncedQuery, setDebouncedQuery] = useState("")

    const [users, setUsers] = useState<User[]>([])

    const user = useRecoilValue(userState)
    const [chats, setChats] = useRecoilState(chatsState)

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        timeout.current && clearTimeout(timeout.current)

        timeout.current = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)
    }, [query])

    useEffect(() => {
        const unload = () => setLoading(false)

        if (!query) {
            setUsers([])
            unload()
            return
        }

        const getUsers = async () => {
            setLoading(true)
            setUsers([])
            let users: User[] = []
            try {
                ({ data: users } = await API.get<User[]>(`/users?nick=${query}`))
            } catch (error) {
                toast.error(error instanceof AxiosError ? error.response?.data?.error : (error as Error).message)
            }
            return users
        }

        query === debouncedQuery && getUsers().then(setUsers).finally(unload)
    }, [debouncedQuery, query])

    const handleSelectedUser = (selectedUser: User) => {
        const chatId = createChatId(user!._id, selectedUser._id)

        console.log("handleselected")
        console.table({ chatId })

        const exists = !!chats?.[chatId]

        if (!exists) {
            const publicUser = maskUser(user)

            setChats(chats => ({
                ...chats,
                [chatId]: {
                    id: chatId,
                    messages: [],
                    members: [publicUser!, selectedUser],
                    indexing: {}
                }
            }))
        }

        navigate("/" + chatId)
        setDialog(null)

    }


    return <Container id="user-dialog">
        <Row>
            <Col className="p-5">
                <h2 className="font-monospace mb-4">Search users</h2>

                <hr />

                <Form className="d-flex position-relative my-5" onSubmit={e => { e.preventDefault() }}>
                    <Form.Control
                        placeholder="Nickname..."
                        className="rounded-0 border-3 font-monospace"
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value) }} />
                    {
                        (loading) &&
                        <div className="position-absolute" style={{ inset: '0.2em 0.7ch 0.1em auto', transform: 'scale(0.65)' }}>
                            <Spinner animation="border" variant="light" />
                        </div>

                    }
                </Form>

                <ListGroup >
                    {users.map((u, i) =>
                        <ListGroup.Item key={`user-${i}`} style={{ borderColor: 'var(--theme-color)' }} className="user-result rounded-0 mb-3 py-3 cursor-pointer text-white border-1" onClick={() => handleSelectedUser(u)}>
                            {u.nick}
                        </ListGroup.Item>
                    )}
                </ListGroup>
            </Col>
        </Row>
    </Container >
}