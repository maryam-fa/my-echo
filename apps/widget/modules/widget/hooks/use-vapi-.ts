import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

interface TanscriptMessage {
    role: "user" | "assistant";
    text: string;
};

export const useVapi = () => {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TanscriptMessage[]>([]);
    useEffect(() => { 
        //Only for testing the Vapi API, otherwise custumers will provide their own API keys.
        const vapiInstance = new Vapi("ab7d9c3b-6050-4454-8731-03439f8578a3");
        setVapi(vapiInstance);

        vapiInstance.on("call-start", () => {
            setIsConnected(true);
            setIsConnecting(false);
            setTranscript([]);
        });

        vapiInstance.on("call-end", () => {
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false);
        });

        vapiInstance.on("speech-start", () => {
            setIsSpeaking(true);
        });
        vapiInstance.on("speech-end", () => {
            setIsSpeaking(false);
        });
        vapiInstance.on("error", (error) => {
            console.log(error, "VAPI_ERROR");
            setIsConnecting(false);
        });
        vapiInstance.on ("message", (message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: message.role === "user" ? "user" : "assistant",
                        text: message.transcript,
                    }
                ]);
            }
        });

        return () => {
            vapiInstance?.stop();
        }
    }, []);

    const startCall = () => {
        setIsConnecting(true);


        if (vapi) {
        //Only for testing the Vapi API, otherwise custumers will provide their own Assistant IDs

            vapi.start("3b867646-bfc0-40b7-80b9-c62c4a375a57");
        }
    };

    const endCall = () => {
        if (vapi) {
            vapi.stop();
        }
    };

    return {
        isSpeaking,
        isConnecting,
        isConnected,
        transcript,
        startCall,
        endCall,
    }

};