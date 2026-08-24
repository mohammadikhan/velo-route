import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Typewriter from 'typewriter-effect';

const videos = ["/bike1.mp4", "/bike2.mp4", "/bike3.mp4"]

const LandingPage = () => {

    const [currentVideo, setCurrentVideo] = useState(0)
    const navigate = useNavigate()

    const handleVideo = () => {
        setCurrentVideo(prev => (prev + 1) % videos.length)
    }

    return (
        <>
            <div style={{display: "flex", position: "fixed", inset: 0}}>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "80px",
                    backgroundColor: "var(--bg)",
                    textAlign: "center",
                }}>
                    <img src="/biking.gif" alt="bike" style={{ width: '250px', marginBottom: '20px' }} />
                    <h1 style={{margin: "0 0 20px", fontSize: "102px", fontWeight: "600px", letterSpacing: "-2px", lineHeight: 1}}>
                        {"VeloRoute".split("").map((letter, i) => (
                            <span
                                key={i}
                                style={{
                                    display: "inline-block",
                                    opacity: 0,
                                    animation: "letterFadeIn 0.5s ease forwards",
                                    animationDelay: `${i * 0.06}s`,
                                }}
                            >
                                {letter}
                            </span>
                        ))}
                    </h1>
                    <div style={{color: 'var(--text-h)', fontSize: "20px"}}>
                        <Typewriter
                            options={{
                                strings: ["Visualize Your Journey.", "Turn GPS Data Into Metric Insights.", "Explore Every Point of Your Trip.", "Because Your Journey is a Story."],
                                autoStart: true,
                                loop: true,
                                delay: 60,
                                deleteSpeed: 20
                            }}
                        />
                    </div>
                    <button
                        onClick={() => navigate("/all-rides")}
                        style={{
                            marginTop: "32px",
                            padding: "14px 42px",
                            backgroundColor: "var(--text-h)",
                            color: "#3c1313",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "22px",
                            fontWeight: 500,
                            fontFamily: "monospace",
                            cursor: "pointer"
                        }}
                    >
                        Get Started
                    </button>
                </div>

                {/*Create Video Loop on Right Side of Page*/}
                <div style={{flex: 1, position: "relative", overflow: "hidden"}}>
                    <video
                        key={currentVideo}
                        autoPlay
                        muted
                        onEnded={handleVideo}
                        style={{width: "100%", height: "100%", objectFit: "cover"}}
                    >
                        <source src={videos[currentVideo]} type="video/mp4"/>
                    </video>
                </div>
            </div>
        </>
    )

}

export default LandingPage;