export default function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((label, i) => {
        const n       = i + 1;
        const done    = n < current;
        const active  = n === current;
        const future  = n > current;

        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                ${done   ? 'bg-brand-deep text-white'   : ''}
                ${active ? 'bg-brand-deep text-white ring-4 ring-brand-pale' : ''}
                ${future ? 'bg-white border-2 border-gray-300 text-brand-gray' : ''}`}>
                {done ? '✓' : n}
              </div>
              <span className={`mt-1 text-[10px] font-semibold hidden sm:block text-center leading-tight
                ${active ? 'text-brand-deep' : 'text-brand-gray'}`}>
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-12px] sm:mt-[-20px] transition-colors
                ${done ? 'bg-brand-deep' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
