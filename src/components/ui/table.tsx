"use client"

export function Table({
  headers,
  children,
  className = "",
}: {
  headers: string[]
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
  )
}

export function Td({
  children,
  className = "",
  colSpan,
}: {
  children: React.ReactNode
  className?: string
  colSpan?: number
}) {
  return <td colSpan={colSpan} className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>
}
