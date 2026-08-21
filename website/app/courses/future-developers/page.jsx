import NavBar from "../../../components/NavBar";
import AppFooter from "../../../components/Footer";
import PublicProgramPage from "../../../components/PublicProgramPage";

export const metadata = {
  title:
    "Future Developers | Coding for Ages 9–12",
  description:
    "Explore Future Developers, Tech Talk Hub's programming and technology pathway for learners aged 9–12.",
};

export default function FutureDevelopersPage() {
  return (
    <>
      <NavBar />
      <PublicProgramPage slug="future-developers" />
      <AppFooter />
    </>
  );
}