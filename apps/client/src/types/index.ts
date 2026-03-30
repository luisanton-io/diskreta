import { reactions } from "constants/reactions";

declare global {
    type Theme = "light" | "dark" | "system";
    type Reaction = typeof reactions[number]
}