import { ChangePasswordCard } from './change-password-card';
import { TwoFactorCard } from './two-factor-card';
import { SignOutEverywhereCard } from './sign-out-everywhere-card';

export function SecurityTab() {
  return (
    <div className="flex flex-col gap-4">
      <ChangePasswordCard />
      <TwoFactorCard />
      <SignOutEverywhereCard />
    </div>
  );
}
