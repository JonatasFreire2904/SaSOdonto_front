import type { BirthdayPatient } from "../types";

interface BirthdayListProps {
  birthdays: BirthdayPatient[];
}

const BirthdayList = ({ birthdays }: BirthdayListProps) => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Aniversariantes do Dia</h3>

      {birthdays.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum aniversariante hoje.</p>
      ) : (
        <div className="space-y-3">
          {birthdays.map((patient) => (
            <article key={patient.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{patient.name}</p>
              {patient.age ? (
                <p className="text-xs text-slate-500 mt-0.5">{patient.age} anos</p>
              ) : null}
              <a
                href={`https://wa.me/${patient.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
              >
                Enviar WhatsApp
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default BirthdayList;
