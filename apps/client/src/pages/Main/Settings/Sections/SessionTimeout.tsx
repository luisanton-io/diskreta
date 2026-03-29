import { sessionTimeoutState } from "atoms/sessionTimeout";
import { useRecoilState } from "recoil";
import Section from ".";

export default function SessionTimeout() {

    const [sessionTimeout, setSessionTimeout] = useRecoilState(sessionTimeoutState)

    return <Section title="Session Timeout">
        <p>Time in seconds for the application to log you out when inactive.</p>

        <select
            className="form-control bg-transparent rounded-0 border text-white"
            defaultValue={sessionTimeout}
            onChange={e => { setSessionTimeout(parseInt(e.target.value)) }}
        >
            <option value="15">15 seconds</option>
            <option value="60">1 minute</option>
            <option value="600">10 minutes</option>
            <option value="3600">1 hour</option>
            <option value="0">Never</option>
        </select>

    </Section >
}