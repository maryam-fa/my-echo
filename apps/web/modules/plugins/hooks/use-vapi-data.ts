import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@workspace/backend/_generated/api";


type Assistant = {
  id: string;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
};

type Assistants = Assistant[];

export const useVapiAssistants = (): {
  data: Assistants;
  isLoading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<Assistants>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getAssistants = useAction(api.private.vapi.getAssistants);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getAssistants();
        setData(result as Assistants);
        setError(null);
      } catch (err) {
        setError(err as Error);
        toast.error("Failed to fetch assistants");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getAssistants]);

  return { data, isLoading, error };
};

type PhoneNumber = {
  id: string;
  name: string;
  number: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type PhoneNumbers = PhoneNumber[];

export const useVapiPhoneNumbers = (): {
  data: PhoneNumbers;
  isLoading: boolean;
  error: Error | null;
} => {
  const [data, setData] = useState<PhoneNumbers>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getPhoneNumbers = useAction(api.private.vapi.getPhoneNumbers);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getPhoneNumbers();
        setData(result as PhoneNumbers);
        setError(null);
      } catch (err) {
        setError(err as Error);
        toast.error("Failed to fetch phone numbers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getPhoneNumbers]);

  return { data, isLoading, error };
};