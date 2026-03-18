const ComingSoon = ({ label }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center h-full py-32 text-center">
    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">construction</span>
    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
      {label ?? "Página"} em construção
    </h2>
    <p className="text-slate-500 text-sm">Esta funcionalidade ainda não foi concluída.</p>
  </div>
);

export default ComingSoon;
