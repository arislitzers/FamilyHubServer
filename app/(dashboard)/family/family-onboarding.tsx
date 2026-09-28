'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CreateFamilyForm } from './create-family-form';
import { JoinFamilyForm } from './join-family-form';

export function FamilyOnboarding() {
  return (
    <div className="w-full">
      <Tabs defaultValue="create" className="mx-auto flex max-w-lg flex-col items-center">
        <TabsList>
          <TabsTrigger value="create">Create a family</TabsTrigger>
          <TabsTrigger value="join">Join with a code</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="w-full">
          <CreateFamilyForm />
        </TabsContent>
        <TabsContent value="join" className="w-full">
          <JoinFamilyForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
