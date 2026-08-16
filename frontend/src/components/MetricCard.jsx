
const MetricCard = ({label, value, unit, style = {} }) => {

    return (
        <>
            <div style={{
                padding: "16px 20px",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                backgroundColor: "#0d1a0f",
                textAlign: "center",
                ...style,
            }}>
                <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#FFF", textTransform: "uppercase", letterSpacing: "0.08em"}}>
                    {label}
                </p>
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 600, color: "var(--text-h)", lineHeight: 1}}>
                    {value} <span style={{ fontSize: "13px", fontWeight: 400, color: "#FFF"}}>{unit}</span>
                </p>
            </div>
        </>
    )
}

export default MetricCard;
