import {
    BrowserRouter as Router,
    Route,
    Link,
    RouteComponentProps
  } from "react-router-dom";

type TParams = { id: string };

const ServerDisplay = ({ match }: RouteComponentProps<TParams>) => {
    return (
        <div>
            <h1>Displays Server {match.params.id}</h1>
        </div>
    )
}

export default ServerDisplay