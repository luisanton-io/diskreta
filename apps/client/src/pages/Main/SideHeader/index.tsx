import SearchDialog from "./SearchDialog";
import Settings from "../Settings";


export default function SideHeader() {

    return <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight text-foreground">diskreta.</h1>
        <div className="flex items-center gap-1">
            <SearchDialog />
            <Settings />
        </div>
    </div>
}
