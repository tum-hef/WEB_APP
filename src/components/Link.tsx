import { useRouteMatch } from "react-router"
import { Link } from 'react-router-dom'

const CustomLink = (label: string, to: string, activeIfExact: boolean) => {
    let match = useRouteMatch({
        path: to,
        exact: activeIfExact
    })

    return (
        <div className={match ? "active" : ""}>
            <Link to={to}>{label}</Link>
        </div>
    )
}

export default CustomLink