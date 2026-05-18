'use client';

import { UserButton, OrganizationSwitcher } from '@clerk/nextjs';
import { Bell } from 'lucide-react';
import { Button } from '@procura/ui';

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
        <OrganizationSwitcher
          appearance={{
            elements: { rootBox: 'w-full', organizationSwitcherTrigger: 'rounded-md border px-3 py-1.5' },
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}
