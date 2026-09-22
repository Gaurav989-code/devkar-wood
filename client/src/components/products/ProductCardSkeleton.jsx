const ProductCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-4/5 rounded-3xl bg-[#E1D3C0]" />

      <div className="px-1 pt-5">
        <div className="h-2.5 w-24 rounded-full bg-[#E1D3C0]" />

        <div className="mt-3 h-6 w-4/5 rounded-full bg-[#E1D3C0]" />

        <div className="mt-4 h-4 w-24 rounded-full bg-[#E1D3C0]" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
