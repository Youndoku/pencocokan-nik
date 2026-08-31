import { useNavigate } from "react-router-dom";
import LandingContent from "../components/LandingContent.jsx";

export default function LandingPage({ jumlahSesi }) {
  const navigate = useNavigate();

  return (
    <LandingContent
      onStart={() => navigate("/pencocokan")}
      jumlahSesi={jumlahSesi}
      onRiwayat={() => navigate("/riwayat")}
    />
  );
}
