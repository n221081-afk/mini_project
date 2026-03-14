export default function DashboardCards({ cards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="card p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
              )}
            </div>
            {card.icon && (
              <div className={`p-3 rounded-lg ${card.iconBg || 'bg-primary-100'}`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
