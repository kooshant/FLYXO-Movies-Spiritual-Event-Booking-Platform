export default function Loader({ size = 'md' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex justify-center items-center py-12">
      <div className={`${sizes[size]} border-4 border-flyxo-primary border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
