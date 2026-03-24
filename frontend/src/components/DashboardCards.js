export default function DashboardCards({ cards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="card p-6 hover:shadow-md transition-all rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
              <p className="text-2xl font-bold text-dark dark:text-white mt-1">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
            {card.icon && (
              <div className={`p-3 rounded-xl ${card.iconBg || 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400'}`}>
                <span className="text-2xl drop-shadow-sm">{card.icon}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
