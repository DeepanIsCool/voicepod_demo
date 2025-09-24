export interface CallInfo {
  name: string;
  email: string;
  phone: string;
  nbfcName: string;
  originalAmount: string;
  outstandingAmount: string;
  emiDueDate: string;
  dpd: string;
  lastPaymentDate: string;
  lastPaymentAmount: string;
  loanType: string;
}

export interface MakeCallPayload {
  number: string;
  roomname: string;
  info: CallInfo;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Initiates a call to the specified number with the given payload.
 */
export const makeCall = async (payload: MakeCallPayload): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/makecall`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    mode: "cors",
  });
  return response;
};

/**
 * Polls the rooms endpoint to check for the status of active calls.
 */
export const pollRooms = async (): Promise<{ rooms?: { name: string }[] }> => {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: "GET",
    mode: "cors",
  });
  if (!response.ok) {
    throw new Error("Failed to poll rooms");
  }
  return response.json();
};