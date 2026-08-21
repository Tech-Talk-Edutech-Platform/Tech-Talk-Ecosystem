import NavBar from "../../../components/NavBar";
import AppFooter from "../../../components/Footer";
import PublicProgramPage from "../../../components/PublicProgramPage";

export const metadata = {
  title: "Junior Coders | Coding for Ages 5–8 | Tech Talk Hub",
  description:
    "Explore Junior Coders, Tech Talk Hub's coding pathway for children aged 5–8.",
};

export default function JuniorCodersPage() {
  return (
    <>
      <NavBar />
      <PublicProgramPage slug="junior-coders" />
      <AppFooter />
    </>
  );
}