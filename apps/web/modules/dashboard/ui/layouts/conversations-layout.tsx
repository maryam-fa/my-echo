
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable";
import { ConversationsPanel } from "../components/coversations-panel";

export const ConversationsLayout = ({
  children
}: { children: React.ReactNode; }) => {
  return (
    // @ts-ignore
    <ResizablePanelGroup className="h-full flex-1 w-full overflow-hidden" direction="horizontal" customstoragekey="conversations-v2">
      <ResizablePanel defaultSize={300} maxSize={500} minSize={300} className=" overflow-y-auto" >
        <ConversationsPanel />
      </ResizablePanel>
      <ResizableHandle withHandle/>
      <ResizablePanel className="relative flex flex-col h-full" defaultSize={70}>
        <div className="flex-1 min-h-0 overflow-y-auto">
        {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}; 