interface ChartPoint {
  label: string;
  value: number;
}

interface AppointmentsMiniChartProps {
  data: ChartPoint[];
}

const AppointmentsMiniChart = ({ data }: AppointmentsMiniChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Atendimentos por dia</h3>

      <div className="flex items-end gap-3 h-40">
        {data.map((point) => {
          const height = Math.max((point.value / maxValue) * 100, point.value > 0 ? 12 : 6);
          return (
            <div key={point.label} className="flex-1 min-w-0">
              <div className="h-32 flex items-end">
                <div
                  className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors"
                  style={{ height: `${height}%` }}
                  aria-label={`${point.label}: ${point.value} atendimentos`}
                  title={`${point.label}: ${point.value}`}
                />
              </div>
              <p className="mt-2 text-[11px] text-center text-slate-500 truncate">{point.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AppointmentsMiniChart;
