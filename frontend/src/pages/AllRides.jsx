

// Helper function to formate time
import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getAllRides} from "../api/rideApi.js";
import UploadModal from "../components/UploadModal.jsx";

const formatTime = (seconds) => {
    const hour = Math.floor(seconds / 3600)
    const minute = Math.floor((seconds % 3600) / 60)
    const second = seconds % 60
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`
}

// Ride Card component to display Ride
const RideCard = ({ride, onClick}) => {
    const [isHovered, setIsHovered] = useState(false)

    const metrics = [
        { label: "Distance", value: `${(ride.totalDistance / 1000).toFixed(2)} km`},
        { label: "Time", value: formatTime(ride.movingTime)},
        { label: "Avg. Speed", value: `${(ride.avgSpeed * 3.6).toFixed(1)} km/h`},
    ]

    const formattedDate = new Date(ride.uploadDateTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: "#0d1a0f",
                boxShadow: isHovered ? "var(--shadow)" : "none",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
        >
            <div style={{display: "flex", height: "160px"}}>
                {/*Add Gif to the left side of the card*/}
                <div style={{
                    width: "140px",
                    flexShrink: 0,
                    borderRight: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "var(--accent-bg)",
                }}
                >
                    <img src="/biking.gif" alt="bike animation" style={{height: "80px"}}/>
                </div>

                {/*Ride side of the card*/}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "12px 20px",
                        }}
                    >
                        <h2 style={{ margin: "0 0 4px", fontSize: "17px" }}>{ride.name}</h2>
                        <p style={{margin: 0, fontSize: "13px", color: "#FFF"}}>{formattedDate}</p>
                    </div>

                    <div style={{height: "1px", backgroundColor: "var(--border)" }}/>

                    {/*List the metrics*/}
                    <div style={{display: "flex"}}>
                        {metrics.map(({label, value }, i) => (
                            <div
                                key={label}
                                style={{
                                    flex: 1,
                                    textAlign: "center",
                                    padding: "12px 8px",
                                    borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center"
                                }}
                            >
                                <p
                                    style={{
                                        margin: "0 0 2px",
                                        fontSize: "11px",
                                        color: "#FFF",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    {label}
                                </p>

                                <p style={{margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-h"}}>
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const AllRides = () => {

    const [rides, setRides] = useState([])
    const [loading, setLoading] = useState(true)
    const [showUpload, setShowUpload] = useState(false)
    const navigate = useNavigate()

    const fetchRides = useCallback(() => {
        setLoading(true)
        getAllRides()
            .then(setRides)
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetchRides()
    }, [fetchRides])

    return(
        <>
            <div style={{ padding: "64px", position: "relative"}}>
                {/*Upload Button*/}
                <button
                    onClick={() => setShowUpload(true)}
                    style={{
                        position: "fixed",
                        right: "40px",
                        top: "40px",
                        padding: "10px 24px",
                        backgroundColor: "var(--text-h)",
                        color: "#3c1313",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: 500,
                        fontFamily: "monospace",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        zIndex: 10,
                    }}
                >
                    Upload Ride
                </button>

                {/*Create Heading and Sub-heading*/}
                <div style={{ textAlign: "center", marginBottom: "48px"}}>
                    <h1 style={{margin: "0 0 16px" }}> Select or Upload Ride </h1>
                    <p style={{ fontSize: "18px", color: "var(--text-h)", marginTop: "32px" }}>
                        Select a ride to visualize its route and performance metrics, or upload a new one to get started
                    </p>
                </div>

                {/*Content States*/}
                {loading && <p style={{color: "var(--text)" }}>Loading Rides...</p>}

                {!loading && rides.length === 0 && (
                    <p style={{color: "var(--text)" }}>No rides yet. Upload your first ride!</p>
                )}

                {/*Create Grid*/}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {rides.map((ride) => (
                        <RideCard
                            key={ride.id}
                            ride={ride}
                            onClick={() => navigate(`/rides/${ride.id}`)}
                        />
                    ))}
                </div>

                {/*Add Upload Modal*/}
                {showUpload && (
                    <UploadModal
                        onClose={() => setShowUpload(false)}
                        onSuccess={() => {
                            setShowUpload(false)
                            fetchRides()
                        }}
                    />
                )}
            </div>
        </>
    )
}
export default AllRides;
