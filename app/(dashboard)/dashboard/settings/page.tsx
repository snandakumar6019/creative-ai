import { Save } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Workspace defaults for tone, generation format, storage, and account preferences."
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Workspace defaults</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tone">Default tone</Label>
              <Input id="tone" defaultValue="Direct, confident, useful" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="channel">Default channel</Label>
              <Input id="channel" defaultValue="Paid social" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bucket">Creative asset bucket</Label>
              <Input id="bucket" defaultValue="creative-assets" />
            </div>
            <Button className="w-fit" type="button">
              <Save className="mr-2 size-4" />
              Save settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
