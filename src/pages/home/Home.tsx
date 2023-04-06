import { useAtomValue } from "jotai";
import { activeCoreAtom } from "../../atoms/coreAtoms";
import Footer from "./components/Footer";
import Introduction from "./HomeIntroduction";

interface HomeProps {
  children: React.ReactNode;
}

function Home(props: HomeProps) {
  const { children } = props;
  const activeCore = useAtomValue(activeCoreAtom);

  return (
    <div className="bg-zinc-900 text-white h-full flex flex-col divide-y-2 divide-zinc-800 overflow-hidden">
      <div className="flex-grow">
        {activeCore ? children : <Introduction />}
        {/* {children} */}
      </div>
      <Footer />
    </div>
  );
}

export default Home;
