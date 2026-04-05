
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
    <ResizablePanelGroup className="h-full flex-1 w-full" direction="horizontal" customstoragekey="conversations-v2">
      <ResizablePanel defaultSize={300} maxSize={500} minSize={300} >
        <ConversationsPanel />
      </ResizablePanel>
      <ResizableHandle withHandle/>
      <ResizablePanel className="h-full" defaultSize={70}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}; 