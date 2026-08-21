import NavBar from "../../../components/NavBar";
import AppFooter from "../../../components/Footer";
import PublicProgramPage from "../../../components/PublicProgramPage";

export const metadata = {
  title:
    "Tech Professionals | Technology for Ages 13–18 | Tech Talk Hub",
  description:
    "Explore Tech Professionals, Tech Talk Hub's advanced technology pathway for teens aged 13–18.",
};

export default function TechProfessionalsPage() {
  return (
    <>
      <NavBar />
      <PublicProgramPage slug="tech-professionals" />
      <AppFooter />
    </>
  );
}