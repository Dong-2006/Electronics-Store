import { Specification } from "@/types";

export function SpecificationTable({ specifications = [] }: { specifications?: Specification[] }) {
  return (
    <div className="overflow-hidden rounded-md border bg-white">
      <table className="w-full text-sm">
        <tbody>
          {specifications.map((item) => (
            <tr key={`${item.key}-${item.value}`} className="border-b last:border-0">
              <td className="w-44 bg-slate-50 px-4 py-3 font-semibold">{item.key}</td>
              <td className="px-4 py-3">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
