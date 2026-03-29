import { createContext } from "react";
import { Socket } from "socket.io-client";
import { SpotlightProps } from "../Spotlight";

interface IChatContext {
    socket: Socket,
    connected: boolean,
    activeChat: Chat,
    recipients: User[],
    setSpotlight: React.Dispatch<React.SetStateAction<SpotlightProps>>
    handleScrollTo: (hash: string) => (e: React.SyntheticEvent) => void,
}

export const ChatContext = createContext<IChatContext>({} as IChatContext)