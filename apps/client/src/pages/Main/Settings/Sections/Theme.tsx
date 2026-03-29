import { Done } from "@mui/icons-material";
import cn from "classnames";
import { ListGroup } from "react-bootstrap";
import { useAuthStore } from "stores/auth";
import Section from ".";
import { Themes } from "constants/themes";

export default function Theme() {
    const currentTheme = useAuthStore(s => s.user?.settings.theme ?? 'Default')
    const updateSettings = useAuthStore(s => s.updateSettings)

    return <Section title="Theme">
        <ListGroup>
            {
                Object.values(Themes).map(theme => (
                    <ListGroup.Item
                        className={cn("rounded-0 mb-2 border bg-transparent cursor-pointer", currentTheme === theme ? "border-warning text-warning" : "border-light text-white")}
                        key={theme}
                        onClick={() => updateSettings({ theme })}>
                        {currentTheme === theme && (
                            <Done className="position-absolute start-0 mx-2" style={{
                                fontSize: '1.25em',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }} />
                        )}
                        <span className="ms-3">{theme}</span>
                    </ListGroup.Item>
                ))
            }
        </ListGroup>
    </Section>
}
