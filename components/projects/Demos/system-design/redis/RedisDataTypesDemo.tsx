"use client"

const dataTypes = [
  { label: "String", value: "hello world", color: "#4FC3F7" },
  { label: "Hash", value: '{a: "hello", b: "world"}', color: "#90CAF9" },
  { label: "List", value: "[A>B>C>C]", color: "#EF5350" },
  { label: "Set", value: "{A<B<C}", color: "#FF7043" },
  { label: "Sorted Set", value: "{A:1, B:2, C:3}", color: "#FFA726" },
  { label: "Stream", value: "{id1=t1.seq(...)}", color: "#AB47BC" },
  { label: "Bitmap", value: "0110110101101101", color: "#CE93D8" },
  { label: "Geo", value: "{A: (50.1, 0.5)}", color: "#66BB6A" },
  { label: "HyperLogLog", value: "01101101 01101111", color: "#42A5F5" },
]

export function RedisDataTypesDemo() {
  return (
    <div className="overflow-x-auto rounded-lg border border-current/5">
      <table className="w-full text-[13px] font-mono border-collapse">
        <thead>
          <tr className="border-b border-current/10 text-xs font-sans font-semibold text-muted-foreground">
            <th className="px-3 py-2 text-left w-[100px]">Type</th>
            <th className="px-3 py-2 text-left">Example Value</th>
          </tr>
        </thead>
        <tbody>
          {dataTypes.map((dt) => (
            <tr key={dt.label} className="border-b border-current/5 last:border-0">
              <td className="px-3 py-1.5 font-sans font-semibold text-xs" style={{ color: dt.color }}>
                {dt.label}
              </td>
              <td className="px-3 py-1.5 text-foreground/80">{dt.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
