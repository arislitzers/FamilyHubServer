import { ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROLE_PERMISSIONS } from '@/types/family.types';
import type { FamilyRole } from '@/types/family.types';

const ROLE_ORDER: FamilyRole[] = ['owner', 'admin', 'member', 'child'];

export function PermissionsReference() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4" /> Permissions
        </CardTitle>
        <CardDescription>What each role can do in this family.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {ROLE_ORDER.map((role) => (
          <div key={role}>
            <Badge variant="outline" className="mb-1.5 capitalize">
              {role}
            </Badge>
            <ul className="ml-4 list-disc text-sm text-dusk-500 dark:text-dusk-200">
              {ROLE_PERMISSIONS[role].map((perm) => (
                <li key={perm}>{perm}</li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
