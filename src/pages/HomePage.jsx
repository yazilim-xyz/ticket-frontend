import { Navbar } from "../components/navbar";
import { Hero } from "../components/hero";
import { Footer } from "../components/footer";

export default function Welcome() {
return (
<div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
<Navbar />
<Hero />
<Footer />
</div>
);
}