interface Props {
  children: React.ReactNode;
}

const DentalCloudLogo = () => (
  <div className="flex items-center gap-3 text-primary">
    <div className="size-8">
      <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path
          clipRule="evenodd"
          d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
          fillRule="evenodd"
        />
      </svg>
    </div>
    <span className="text-2xl font-extrabold tracking-tight">DentalCloud</span>
  </div>
);

const DentalCloudLogoSmall = () => (
  <div className="flex items-center gap-2 text-primary">
    <div className="size-6">
      <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path
          clipRule="evenodd"
          d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
          fillRule="evenodd"
        />
      </svg>
    </div>
    <span className="text-xl font-bold tracking-tight">DentalCloud</span>
  </div>
);

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display">
      {/* Painel Esquerdo - Institucional */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-primary/5 border-r border-primary/10">
        <div>
          <DentalCloudLogo />
        </div>

        <div className="flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-8 relative overflow-hidden">
            <span className="material-symbols-outlined text-[160px] text-primary/40">
              dentistry
            </span>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-primary/10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Gestão de Precisão para Consultórios Modernos
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Otimize as operações da sua clínica, agendamento de pacientes e
            prontuário digital com a plataforma em nuvem mais intuitiva do setor.
          </p>
        </div>

        <div className="flex gap-6 text-sm font-medium text-slate-500">
          <a className="hover:text-primary transition-colors" href="#">
            Política de Privacidade
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Termos de Serviço
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Suporte
          </a>
        </div>
      </div>

      {/* Painel Direito - Conteúdo */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-8">
              <DentalCloudLogoSmall />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;