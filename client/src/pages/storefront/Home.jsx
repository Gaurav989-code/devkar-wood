import HeroSection from "../../components/home/HeroSection.jsx";
import FeaturedCollections from "../../components/home/FeaturedCollections.jsx";
import FeaturedProducts from "../../components/home/FeaturedProducts.jsx";
import CraftsmanshipSection from "../../components/home/CraftsmanshipSection.jsx";
import CustomCarvingCTA from "../../components/home/CustomCarvingCTA.jsx";
import CustomerGallery from "../../components/home/CustomerGallery.jsx";
import TrustBenefits from "../../components/home/TrustBenefits.jsx";
import CraftMarquee from "../../components/home/CraftMarquee.jsx";

const Home = () => {
  return (
    <main>
      <HeroSection />

      <section
        id="homepage-content"
        className="bg-[#F7F0E5] px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-360 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A45A3A]">
            Devkar Wood Carvings
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight text-[#2A1810] sm:text-5xl lg:text-6xl">
            Every piece begins with wood and becomes a story.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#6F5A4E]">
            Explore handcrafted artwork rooted in traditional techniques and
            thoughtfully created for contemporary spaces.
          </p>
        </div>
      </section>

      <CraftMarquee />

      <FeaturedCollections />

      <FeaturedProducts />

      <CraftsmanshipSection />

      <CustomCarvingCTA />

      <TrustBenefits />

      <CustomerGallery />
    </main>
  );
};

export default Home;
