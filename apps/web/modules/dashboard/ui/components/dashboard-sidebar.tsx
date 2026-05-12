"use client";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
    CreditCardIcon,
    InboxIcon,
    LayoutDashboardIcon,
    LibraryBigIcon,
    Mic,
    PaletteIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

const customerSupportItems = [
    {
        title: "Conversations",
        url: "/conversations",
        icon: InboxIcon,
    },
    {
        title: "Knowldge Base",
        url: "/files",
        icon: LibraryBigIcon,
    },
];

const configurationItems = [
    {
        title: "Widget Customization",
        url: "/customization",
        icon: PaletteIcon,
    },
    {
        title: "Integrations",
        url: "/integrations",
        icon: LayoutDashboardIcon,
    },
    {
        title: "Voice Assistant",
        url: "/plugins/vapi",
        icon: Mic,
    },
];

const accountItems = [
    {
        title: "Plans & Billing",
        url: "/billing",
        icon: CreditCardIcon,
    },
];

const NavGroup = ({
    label,
    items,
    isActive,
}: {
    label: string;
    items: { title: string; url: string; icon: React.ElementType }[];
    isActive: (url: string) => boolean;
}) => (
    <SidebarGroup className="py-2">
        <SidebarGroupLabel className="mb-1 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
            <SidebarMenu className="gap-1">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive(item.url)}
                            className={cn(
                                "rounded-md",
                                isActive(item.url) &&
                                    "bg-gradient-to-b from-sidebar-primary to-[#0b63f3]! text-sidebar-primary-foreground! hover:to-[#0b63f3]/90!"
                            )}
                            tooltip={item.title}
                        >
                            <Link href={item.url}>
                                <item.icon className="size-4" />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroupContent>
    </SidebarGroup>
);

export const DashboardSidebar = () => {
    const pathname = usePathname();

    const isActive = (url: string) => {
        if (url === "/") return pathname === "/";
        return pathname.startsWith(url);
    };

    return (
        <TooltipProvider>
            <Sidebar className="group" collapsible="icon">
                <SidebarHeader className="pb-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild size="lg">
                                <OrganizationSwitcher
                                    hidePersonal
                                    skipInvitationScreen
                                    appearance={{
                                        elements: {
                                            rootBox: "w-full! h-8!",
                                            avatarBox: "size-4! rounded-sm!",
                                            organizationSwitcherTrigger:
                                                "w-full! justify-start! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
                                            organizationPreview:
                                                "group-data-[collapsible=icon]:justify-center! gap-2!",
                                            organizationPreviewTextContainer:
                                                "group-data-[collapsible=icon]:hidden! text-xs! font-medium! text-sidebar-foreground!",
                                            organizationSwitcherTriggerIcon:
                                                "group-data-[collapsible=icon]:hidden! ml-auto! text-sidebar-foreground!",
                                        },
                                    }}
                                />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="gap-0 divide-y divide-border">
                    <NavGroup
                        label="Customer Support"
                        items={customerSupportItems}
                        isActive={isActive}
                    />
                    <NavGroup
                        label="Configuration"
                        items={configurationItems}
                        isActive={isActive}
                    />
                    <NavGroup
                        label="Account"
                        items={accountItems}
                        isActive={isActive}
                    />
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <UserButton
                                showName
                                appearance={{
                                    elements: {
                                        rootBox: "w-full! h-8!",
                                        userButtonTrigger:
                                            "w-full! p-2! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
                                        userButtonBox:
                                            "w-full! flex-row-reverse! justify-end! gap-2! group-data-[collapsible=icon]:justify-center! text-side-bar-foreground!",
                                        userButtonOuterIdentifier:
                                            "pl-0! group-data-[collapsible=icon]:hidden!",
                                        avatarBox: "size-4",
                                    },
                                }}
                            />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
        </TooltipProvider>
    );
};