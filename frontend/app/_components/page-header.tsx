import { AppLogo } from "./app-logo";

export function PageHeader() {
  return (
    <header className="flex h-14 items-center px-5">
      <AppLogo className="text-foreground" />
    </header>
  );
}
