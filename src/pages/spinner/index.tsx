import PropagateLoader from "react-spinners/PropagateLoader";
import S from "./index.module.scss";

function Spinner() {

return (
    <div className={S.body}>
        <PropagateLoader color="#0073FF" style={{background: 'rgba(0,0,0,0.1)'}}/>
    </div>
);
}

export default Spinner;