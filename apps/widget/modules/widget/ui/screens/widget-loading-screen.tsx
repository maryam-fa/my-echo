"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import { contactSessionIdAtomFamily, errorMessageAtom, loadingMessageAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "../../atoms/widget-atoms";
import { WidgetHeader } from "../components/widget-header";
import { useState } from "react";
import { useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

type InitStep = "org" | "session" | "settings" | "vapi" | "done";
 
export const WidgetLoadingScreen = ({organizationId}: { organizationId: string | null }) => {
  const [step, setStep] = useState<InitStep>("org")
  const [sessionValid, setSessionValid] = useState(false);

  const loadingMessage =useAtomValue(loadingMessageAtom);
  const setWidgetSettings = useSetAtom(widgetSettingsAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);

  const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""));

  //step 1: validate organization
  const validateOrganization = useAction(api.public.organizations.validate);
  useEffect(() => {
    if (step !== "org") {
      return;
    }

    setLoadingMessage("Finding organization ID...");

    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("errors");
      return;
    }

    setLoadingMessage("Verifying organization...");
    validateOrganization({ organizationId })
      .then((result) =>{
        if (result.valid) {
          setOrganizationId(organizationId);
          setStep("session");

        } else {
          setErrorMessage(result.reason || "Invalid configuration");
          setScreen("errors");
        }
      })
      .catch(() => {
        setErrorMessage("Unable to verifying organization");
        setScreen("errors");

      })


  }, [step, organizationId, setErrorMessage, setScreen, setStep, setOrganizationId, validateOrganization, setLoadingMessage]);

  // step 2: validate session (if exists)
  const validateContactSession = useMutation(api.public.contactSessions.validate);

  useEffect(() => {
    if (step !== "session") {
      return;
    }

    setLoadingMessage("Finding contact session ID...");


    if (!contactSessionId) {
      setSessionValid(false);
      setStep("settings");
      return;
    }

    setLoadingMessage("Validating session...");

    validateContactSession({ contactSessionId })
      .then((result) => {
        setSessionValid(result.valid);
        setStep("settings");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("settings");
      })

  }, [step, contactSessionId, validateContactSession, setLoadingMessage]);

  // step 3 

  // Step 3: Load Widget Settings
  const widgetSettings = useQuery(
    api.public.widgetSettings.getByOrganizationId,
    organizationId ? { organizationId } : "skip"
  );


  useEffect(() => {
    if (step !== "settings") {

      return;
    }

    setLoadingMessage("Loading widget settings...");

    if (widgetSettings !== undefined && organizationId) {
      setWidgetSettings(widgetSettings);
      setStep("done");
    }
  },   [
    step, 
    widgetSettings, 
    setStep, 
    setWidgetSettings, 
    setLoadingMessage
  ]);
  

  useEffect(() => {
    if (step !== "done") {
      return;
    }

    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, contactSessionId, sessionValid, setScreen]);



    return (
        <>
          <WidgetHeader>
           <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                    <p className="text-3xl">
                        Hi there! 👋
                    </p>
                    <p className="text-lg">
                        Let&apos;s get you started
                    </p>

                </div>
          </WidgetHeader>
          <div className="flex flex-1 flex-col justify-center items-center gap-y-4 p-4 text-muted-foreground">
            <LoaderIcon className="animate-spin"/>
            <p className="text-sm">
              {loadingMessage || "Loading..."}        
            </p>
          </div>
        </>
    );
    
};