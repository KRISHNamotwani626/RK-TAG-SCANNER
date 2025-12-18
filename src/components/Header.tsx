import logo from '@/assets/rk-logo.png';

export function Header() {
  return (
    <header className="py-6 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="RK Gold"
            className="h-14 w-14 object-contain drop-shadow-lg"
          />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-gradient-gold">
              RK GOLD
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Jewellery Tag Scanner & Invoice Generator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
