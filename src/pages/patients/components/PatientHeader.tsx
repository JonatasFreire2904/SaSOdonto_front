interface PatientHeaderProps {
  patient: {
    id: string;
    fullName: string;
    cpf: string;
    birthDate: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  };
  allergies: string[];
  risks: string[];
  onPrint: () => void;
  onNewAppointment: () => void;
}

const calcAge = (birthDate: string) => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const genderLabel = (g: string) => {
  switch (g) {
    case "male": return "Masculino";
    case "female": return "Feminino";
    default: return "Outro";
  }
};

const PatientHeader = ({ patient, allergies, risks, onPrint, onNewAppointment }: PatientHeaderProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex gap-6 items-center">
        <div className="relative">
            <div className="size-24 rounded-xl bg-primary/10 border-4 border-slate-50 shadow-inner flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">person</span>
            </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white dark:border-slate-900 size-6 rounded-full" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{patient.fullName}</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {calcAge(patient.birthDate)} anos • {genderLabel(patient.gender)} • {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {allergies.map((allergy) => (
              <span
                key={allergy}
                className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-800"
              >
                <span className="material-symbols-outlined text-sm">warning</span>
                ALERGIA: {allergy}
              </span>
            ))}
            {risks.map((risk) => (
              <span
                key={risk}
                className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-orange-200 dark:border-orange-800"
              >
                <span className="material-symbols-outlined text-sm">warning</span>
                Alto Risco: {risk}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <button
          onClick={onPrint}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-200 transition-all"
        >
          <span className="material-symbols-outlined">print</span> Imprimir
        </button>
        <button
          onClick={onNewAppointment}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined">calendar_add_on</span> Nova Consulta
        </button>
      </div>
    </div>
  );
};

export default PatientHeader;
