import { CATEGORIES } from '../../utils/constants';

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange('')}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
          !selected
            ? 'bg-flyxo-primary text-white shadow-lg shadow-rose-500/30'
            : 'bg-white/10 dark:bg-white/5 hover:bg-white/20'
        }`}
      >
        All Events
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
            selected === cat.id
              ? 'bg-flyxo-primary text-white shadow-lg shadow-rose-500/30'
              : 'bg-white/10 dark:bg-white/5 hover:bg-white/20'
          }`}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
