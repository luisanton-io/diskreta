import { Themes } from "constants/themes";
import { reactions } from "pages/Main/Chat/Message";

declare global {
    type Theme = typeof Themes[keyof typeof Themes];
    type Reaction = typeof reactions[number]
}