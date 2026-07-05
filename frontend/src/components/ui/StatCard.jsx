// A simple metric display card.
// Used in profile stats row.
const StatCard = ({ value, label, highlight = false }) => (
  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
    <div className={`
      text-2xl font-medium mb-0.5
      ${highlight ? 'text-purple-600' : 'text-gray-900'}
    `}>
      {value}
    </div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
)

export default StatCard