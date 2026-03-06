"use client";

import { useAtomValue } from "jotai";
import { WidgetAuthScreeen } from "../screens/widget-auth-screen";
import { screenAtom } from "../../atoms/widget-atoms";


interface Props {
    organizationId: string;
};

export const WidgetView = ({ organizationId }: Props) => {
    const screen = useAtomValue(screenAtom);

    const screenComponents = {
        errors: <p>TODO: Error</p>,
        loading: <p>TODO: Loading</p>,
        auth: <WidgetAuthScreeen />,
        voice: <p>TODO: Voice</p>,
        inbox: <p>TODO: Inbox</p>,
        selection: <p>TODO: Selection</p>,
        chat: <p>TODO: Chat</p>,
        contact: <p>TODO: Contact</p>,

        
    }
    return (
        <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
            {screenComponents[screen]}
        </main>
    );
};