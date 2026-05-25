import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable";
import { ContactPanel } from "../components/contact-panel";

export const ConversationIdLayout = ({ children }: { children: React.ReactNode; }) => {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex h-full flex-1 flex-col min-w-0">
        {children}
      </div>
      <div className="hidden xl:flex w-[300px] border-l flex-col shrink-0">
        <div className="p-4 font-semibold border-b"><ContactPanel /></div>
      </div>
    </div>
  );
};