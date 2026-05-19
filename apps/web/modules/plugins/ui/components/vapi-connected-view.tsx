"use client";

import { BotIcon, PhoneIcon, SettingsIcon, UnplugIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { VapiPhoneNumbersTab } from "./vapi-phone-numbers-tab";
import { VapiAssistantsTab } from "./vapi-assistants-tab";

interface VapiConnectedViewProps {
  onDisconnect: () => void;
}

export const VapiConnectedView = ({ onDisconnect }: VapiConnectedViewProps) => {
  const [activeTab, setActiveTab] = useState("phone-numbers");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                alt="Vapi"
                className="rounded-lg object-contain"
                height={48}
                width={48}
                src="/vapi.jpg"
              />
              <div>
                <CardTitle>Vapi Integration</CardTitle>
                <CardDescription>
                  Manage your phone numbers and AI assistants
                </CardDescription>
              </div>
            </div>
            <Button onClick={onDisconnect} size="sm" variant="destructive">
              <UnplugIcon />
              Disconnect
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg border bg-muted">
                <SettingsIcon className="size-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>Widget Configuration</CardTitle>
                <CardDescription>
                  Set up voice calls for your chat widget
                </CardDescription>
              </div>
            </div>
            <Button asChild>
              <Link href="/customization">
                <SettingsIcon />
                Configure
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="overflow-hidden rounded-lg border bg-background">
      <Tabs className="flex flex-col gap-0" defaultValue="phone-numbers" onValueChange={setActiveTab} value={activeTab}>

          <TabsList className="grid h-12 w-full grid-cols-2 rounded-none bg-muted p-0">
            <TabsTrigger
              className="h-full rounded-none border-r data-[state=active]:bg-background data-[state=active]:shadow-none"
              value="phone-numbers"
            >
              <PhoneIcon className="mr-2 size-4" />
              Phone Numbers
            </TabsTrigger>
            <TabsTrigger
              className="h-full rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none"
              value="assistants"
            >
              <BotIcon className="mr-2 size-4" />
              AI Assistants
            </TabsTrigger>
          </TabsList>
          <TabsContent className="m-0" value="phone-numbers">
            <VapiPhoneNumbersTab />
          </TabsContent>
          <TabsContent className="m-0" value="assistants">
            <VapiAssistantsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};